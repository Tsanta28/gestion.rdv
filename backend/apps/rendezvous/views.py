import datetime
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response
from .models import RendezVous, PropositionCreneau
from .serializers import (
    RendezVousSerializer, RendezVousStatutSerializer, PropositionCreneauSerializer,
)
from apps.consultations.models import Consultation
from apps.consultations.serializers import ConsultationSerializer
from apps.notifications.models import Notification


def _notifier(user, message, type_=Notification.Type.INFO, rendezvous=None):
    if user is None:
        return
    Notification.objects.create(user=user, message=message, type=type_, rendezvous=rendezvous)


def _rejeter_si_date_passee(valeur, champ='date_heure'):
    """Leve une ValidationError si la date/heure fournie est deja passee."""
    dt = valeur if isinstance(valeur, datetime.datetime) else parse_datetime(str(valeur))
    if dt is None:
        raise ValidationError({champ: 'Format de date/heure invalide.'})
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt)
    if dt < timezone.now():
        raise ValidationError({champ: 'Cette date est deja passee.'})
    return dt


class RendezVousViewSet(viewsets.ModelViewSet):
    queryset = RendezVous.objects.select_related(
        'patient__user', 'docteur__user',
    ).all()
    serializer_class = RendezVousSerializer

    def get_queryset(self):
        u = self.request.user
        qs = super().get_queryset()
        if u.is_patient:
            qs = qs.filter(patient__user=u)
        elif u.is_docteur:
            qs = qs.filter(docteur__user=u)
        else:
            # admin / secretaire : tout, avec filtres optionnels
            docteur_id = self.request.query_params.get('docteur')
            patient_id = self.request.query_params.get('patient')
            if docteur_id:
                qs = qs.filter(docteur_id=docteur_id)
            if patient_id:
                qs = qs.filter(patient_id=patient_id)

        statut = self.request.query_params.get('statut')
        if statut:
            statuts = [s.strip() for s in statut.split(',') if s.strip()]
            qs = qs.filter(statut__in=statuts) if len(statuts) > 1 else qs.filter(statut=statuts[0])
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        # Toute creation (patient direct, ou secretaire/admin au nom d'un
        # patient qui a d'abord consulte la secretaire) demarre le meme
        # workflow de negociation : le docteur doit valider, refuser ou
        # proposer un autre creneau. Pour les autres roles, patient_id est
        # obligatoire.
        if u.is_patient:
            rdv = serializer.save(patient=u.patient_profile, statut=RendezVous.Statut.DEMANDE_ENVOYEE)
        else:
            if 'patient' not in serializer.validated_data:
                raise ValidationError({'patient_id': 'Ce champ est obligatoire.'})
            rdv = serializer.save(statut=RendezVous.Statut.DEMANDE_ENVOYEE)
        _notifier(
            rdv.docteur.user,
            f'Nouvelle demande de rendez-vous de {rdv.patient.user.first_name} {rdv.patient.user.last_name}.',
            Notification.Type.INFO, rdv,
        )

    @action(detail=True, methods=['patch'])
    def statut(self, request, pk=None):
        """Mise a jour generique du statut (secretaire/admin/docteur)."""
        rdv = self.get_object()
        serializer = RendezVousStatutSerializer(rdv, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(RendezVousSerializer(rdv).data)

    @action(detail=True, methods=['patch'])
    def accepter(self, request, pk=None):
        """Le docteur accepte directement une demande (creneau disponible)."""
        rdv = self.get_object()
        u = request.user
        if not (u.is_docteur and rdv.docteur.user_id == u.id) and not u.is_admin:
            raise PermissionDenied("Seul le docteur concerne peut accepter cette demande.")
        rdv.statut = RendezVous.Statut.CONFIRME
        rdv.save(update_fields=['statut'])
        _notifier(
            rdv.patient.user,
            f'Dr. {rdv.docteur.user.last_name} a confirmé votre rendez-vous du '
            f'{rdv.date_heure.strftime("%d/%m/%Y à %H:%M")}.',
            Notification.Type.SUCCESS, rdv,
        )
        return Response(RendezVousSerializer(rdv).data)

    @action(detail=True, methods=['patch'])
    def refuser(self, request, pk=None):
        """
        Refus d'un RDV.
        - Docteur refusant une demande -> statut 'refuse'
        - Patient refusant une proposition -> statut 'annule'
        """
        rdv = self.get_object()
        u = request.user
        if u.is_docteur and rdv.docteur.user_id == u.id:
            rdv.statut = RendezVous.Statut.REFUSE
            rdv.save(update_fields=['statut'])
            _notifier(
                rdv.patient.user,
                f'Dr. {rdv.docteur.user.last_name} a refusé votre demande de rendez-vous.',
                Notification.Type.WARNING, rdv,
            )
        elif u.is_patient and rdv.patient.user_id == u.id:
            rdv.statut = RendezVous.Statut.ANNULE
            rdv.save(update_fields=['statut'])
            _notifier(
                rdv.docteur.user,
                f'{rdv.patient.user.first_name} {rdv.patient.user.last_name} a refusé '
                f'la proposition de créneau.',
                Notification.Type.WARNING, rdv,
            )
        elif u.is_admin:
            rdv.statut = RendezVous.Statut.ANNULE
            rdv.save(update_fields=['statut'])
        else:
            raise PermissionDenied("Vous n'etes pas autorise a modifier ce rendez-vous.")
        return Response(RendezVousSerializer(rdv).data)

    @action(detail=True, methods=['post'], url_path='proposer-creneau')
    def proposer_creneau(self, request, pk=None):
        """
        Propose 1 a 3 creneaux alternatifs. Body: {"creneaux": ["2026-10-01T09:00:00", ...]}
        Autorise le docteur concerne, ou la secretaire/admin (qui peut
        proposer un creneau disponible au nom du docteur apres consultation
        de son agenda).
        """
        rdv = self.get_object()
        u = request.user
        est_le_docteur = u.is_docteur and rdv.docteur.user_id == u.id
        if not (est_le_docteur or u.is_secretaire or u.is_admin):
            raise PermissionDenied("Seul le docteur concerne ou la secretaire peut proposer un creneau.")

        creneaux = request.data.get('creneaux') or []
        if not creneaux or len(creneaux) > 3:
            raise ValidationError({'creneaux': 'Fournir entre 1 et 3 creneaux.'})
        for c in creneaux:
            _rejeter_si_date_passee(c, 'creneaux')

        propositions = []
        for c in creneaux:
            propositions.append(PropositionCreneau.objects.create(
                rendezvous=rdv, date_heure_proposee=c, propose_par=u,
            ))
        rdv.statut = RendezVous.Statut.PROPOSITION_ENVOYEE
        rdv.save(update_fields=['statut'])
        _notifier(
            rdv.patient.user,
            f'Dr. {rdv.docteur.user.last_name} vous propose {"un nouveau créneau" if len(creneaux) == 1 else "de nouveaux créneaux"} '
            f'pour votre rendez-vous.',
            Notification.Type.INFO, rdv,
        )
        return Response({
            'rendezvous': RendezVousSerializer(rdv).data,
            'propositions': PropositionCreneauSerializer(propositions, many=True).data,
        })

    @action(
        detail=True, methods=['patch'],
        url_path=r'accepter-proposition/(?P<proposition_id>[^/.]+)',
    )
    def accepter_proposition(self, request, pk=None, proposition_id=None):
        """Le patient accepte l'une des propositions du docteur."""
        rdv = self.get_object()
        u = request.user
        if not (u.is_patient and rdv.patient.user_id == u.id):
            raise PermissionDenied("Seul le patient concerne peut accepter une proposition.")
        try:
            proposition = rdv.propositions.get(pk=proposition_id)
        except PropositionCreneau.DoesNotExist:
            return Response({'detail': 'Proposition introuvable.'}, status=404)

        if proposition.date_heure_proposee < timezone.now():
            return Response(
                {'detail': 'Ce creneau propose est desormais passe. Demandez un nouveau creneau.'},
                status=400,
            )

        proposition.statut = PropositionCreneau.Statut.ACCEPTEE
        proposition.save(update_fields=['statut'])
        rdv.propositions.exclude(pk=proposition.pk).update(statut=PropositionCreneau.Statut.REFUSEE)
        rdv.date_heure = proposition.date_heure_proposee
        rdv.statut = RendezVous.Statut.CONFIRME
        rdv.save(update_fields=['date_heure', 'statut'])
        _notifier(
            rdv.docteur.user,
            f'{rdv.patient.user.first_name} {rdv.patient.user.last_name} a accepté le créneau proposé '
            f'du {rdv.date_heure.strftime("%d/%m/%Y à %H:%M")}.',
            Notification.Type.SUCCESS, rdv,
        )
        return Response(RendezVousSerializer(rdv).data)

    @action(detail=True, methods=['patch'])
    def reassigner(self, request, pk=None):
        """
        La secretaire (ou l'admin) propose un autre docteur au patient,
        avec eventuellement une nouvelle date/heure. Le RDV repart en
        'demande_envoyee' : le nouveau docteur doit a son tour valider.
        Body: {"docteur_id": <id>, "date_heure": "..." (optionnel)}
        """
        rdv = self.get_object()
        u = request.user
        if not (u.is_secretaire or u.is_admin):
            raise PermissionDenied("Seules la secretaire et l'admin peuvent reassigner un rendez-vous.")

        docteur_id = request.data.get('docteur_id')
        if not docteur_id:
            raise ValidationError({'docteur_id': 'Ce champ est obligatoire.'})

        from apps.docteurs.models import Docteur
        try:
            nouveau_docteur = Docteur.objects.get(pk=docteur_id)
        except Docteur.DoesNotExist:
            return Response({'detail': 'Docteur introuvable.'}, status=404)

        rdv.docteur = nouveau_docteur
        date_heure = request.data.get('date_heure')
        if date_heure:
            _rejeter_si_date_passee(date_heure)
            rdv.date_heure = date_heure
        rdv.statut = RendezVous.Statut.DEMANDE_ENVOYEE
        # Les propositions precedentes ne concernent plus ce docteur.
        rdv.propositions.update(statut=PropositionCreneau.Statut.REFUSEE)
        rdv.save(update_fields=['docteur', 'date_heure', 'statut'])
        _notifier(
            rdv.patient.user,
            f'Votre demande a été transférée à Dr. {nouveau_docteur.user.last_name} ({nouveau_docteur.specialite}).',
            Notification.Type.INFO, rdv,
        )
        _notifier(
            nouveau_docteur.user,
            f'Nouvelle demande de rendez-vous de {rdv.patient.user.first_name} {rdv.patient.user.last_name}.',
            Notification.Type.INFO, rdv,
        )
        return Response(RendezVousSerializer(rdv).data)

    @action(detail=True, methods=['get', 'post', 'put'])
    def consultation(self, request, pk=None):
        """Compte-rendu de consultation associe a ce RDV (cree/modifie par le docteur)."""
        rdv = self.get_object()
        u = request.user

        if request.method == 'GET':
            if not hasattr(rdv, 'consultation'):
                return Response({'detail': 'Aucune consultation enregistree.'}, status=404)
            return Response(ConsultationSerializer(rdv.consultation).data)

        if not (u.is_docteur and rdv.docteur.user_id == u.id):
            raise PermissionDenied("Seul le docteur concerne peut renseigner la consultation.")

        consultation, _ = Consultation.objects.get_or_create(rendezvous=rdv)
        serializer = ConsultationSerializer(consultation, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """Renvoie les creneaux libres d'un docteur a une date donnee (deduit des RDV existants)."""
        docteur_id = request.query_params.get('docteur')
        date = request.query_params.get('date')
        if not docteur_id or not date:
            return Response({'detail': 'Parametres docteur et date requis.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.docteurs.models import Docteur
        try:
            docteur = Docteur.objects.get(pk=docteur_id)
        except Docteur.DoesNotExist:
            return Response({'detail': 'Docteur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        rdv_pris = RendezVous.objects.filter(
            docteur=docteur, date_heure__date=date,
        ).exclude(statut__in=[RendezVous.Statut.ANNULE, RendezVous.Statut.REFUSE]).values_list('date_heure', flat=True)

        jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
        try:
            d = datetime.date.fromisoformat(date)
        except ValueError:
            return Response({'detail': 'Format de date invalide (AAAA-MM-JJ).'}, status=status.HTTP_400_BAD_REQUEST)
        jour_nom = jours[d.weekday()]
        creneaux_jour = docteur.disponibilites.get(jour_nom, [])

        heures_prises = {dt.strftime('%H:%M') for dt in rdv_pris}
        return Response({
            'docteur': docteur.id,
            'date': date,
            'creneaux_configures': creneaux_jour,
            'heures_deja_prises': sorted(heures_prises),
        })
