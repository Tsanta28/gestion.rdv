from datetime import datetime
from django.utils import timezone
from django.utils.dateparse import parse_datetime, parse_date
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.permissions import IsDocteur, IsPatient, IsSecretaire
from apps.docteurs.models import Docteur
from apps.rendezvous.models import RendezVous
from apps.rendezvous.serializers import RendezVousSerializer


def _parse_bound(value, end_of_day=False):
    if not value:
        return None
    dt = parse_datetime(value)
    if not dt:
        d = parse_date(value)
        if not d:
            return None
        dt = datetime.combine(d, datetime.max.time() if end_of_day else datetime.min.time())
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt)
    return dt


class AgendaDocteurView(APIView):
    """
    Agenda d'un docteur sur une periode donnee.
    - Le docteur connecte ne peut consulter que son propre agenda.
    - L'admin et la secretaire peuvent consulter l'agenda de n'importe quel docteur.
    """
    permission_classes = [IsDocteur | IsSecretaire]

    def get(self, request, docteur_id):
        u = request.user
        if u.is_docteur and not (u.is_admin or u.is_secretaire):
            if not hasattr(u, 'docteur_profile') or u.docteur_profile.id != int(docteur_id):
                return Response({'detail': "Vous ne pouvez consulter que votre propre agenda."}, status=403)

        try:
            docteur = Docteur.objects.select_related('user').get(pk=docteur_id)
        except Docteur.DoesNotExist:
            return Response({'detail': 'Docteur introuvable.'}, status=404)

        qs = RendezVous.objects.filter(docteur=docteur).select_related('patient__user', 'docteur__user')
        start = _parse_bound(request.query_params.get('start'))
        end = _parse_bound(request.query_params.get('end'), end_of_day=True)
        if start:
            qs = qs.filter(date_heure__gte=start)
        if end:
            qs = qs.filter(date_heure__lte=end)
        statut = request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)

        return Response(RendezVousSerializer(qs, many=True).data)


class AgendaTousView(APIView):
    """Agenda global de tous les docteurs - reserve a l'admin et a la secretaire."""
    permission_classes = [IsSecretaire]

    def get(self, request):
        qs = RendezVous.objects.select_related('patient__user', 'docteur__user').all()
        start = _parse_bound(request.query_params.get('start'))
        end = _parse_bound(request.query_params.get('end'), end_of_day=True)
        if start:
            qs = qs.filter(date_heure__gte=start)
        if end:
            qs = qs.filter(date_heure__lte=end)
        docteur_id = request.query_params.get('docteur')
        if docteur_id:
            qs = qs.filter(docteur_id=docteur_id)
        specialite = request.query_params.get('specialite')
        if specialite:
            qs = qs.filter(docteur__specialite__iexact=specialite)
        statut = request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)

        return Response(RendezVousSerializer(qs, many=True).data)


class AgendaPatientView(APIView):
    """
    GET /api/agenda/patient/?start=&end=
    RDV, demandes et propositions du patient connecte, sur la periode.
    """
    permission_classes = [IsPatient]

    def get(self, request):
        try:
            patient = request.user.patient_profile
        except Exception:
            return Response({'detail': 'Aucun profil patient.'}, status=404)

        qs = RendezVous.objects.filter(patient=patient).select_related('patient__user', 'docteur__user')
        start = _parse_bound(request.query_params.get('start'))
        end = _parse_bound(request.query_params.get('end'), end_of_day=True)
        if start:
            qs = qs.filter(date_heure__gte=start)
        if end:
            qs = qs.filter(date_heure__lte=end)

        return Response(RendezVousSerializer(qs, many=True).data)
