from datetime import date, timedelta
from django.db.models import Count
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.permissions import IsAdmin, IsSecretaire, IsDocteur, IsPatient
from apps.rendezvous.models import RendezVous
from apps.patients.models import Patient
from apps.docteurs.models import Docteur
from apps.users.models import User

JOURS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
MOIS_FR = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
]


def _derniers_jours(n):
    """Renvoie les n derniers jours (dont aujourd'hui), du plus ancien au plus recent."""
    today = date.today()
    return [today - timedelta(days=i) for i in range(n - 1, -1, -1)]


def _derniers_mois(n):
    """Renvoie les n derniers mois (annee, mois), du plus ancien au plus recent."""
    today = date.today()
    mois = []
    y, m = today.year, today.month
    for _ in range(n):
        mois.append((y, m))
        m -= 1
        if m == 0:
            m = 12
            y -= 1
    return list(reversed(mois))


class PatientDashboardView(APIView):
    permission_classes = [IsPatient]

    def get(self, request):
        patient = request.user.patient_profile
        now = date.today()
        rdvs = RendezVous.objects.filter(patient=patient)
        a_venir = rdvs.filter(date_heure__date__gte=now).exclude(statut=RendezVous.Statut.ANNULE).order_by('date_heure')
        passes = rdvs.filter(date_heure__date__lt=now)
        prochain = a_venir.first()

        # RDV par mois (6 derniers mois) - pour le graphique d'historique
        rdv_par_mois = []
        for (y, m) in _derniers_mois(6):
            total = rdvs.filter(date_heure__year=y, date_heure__month=m).exclude(
                statut=RendezVous.Statut.ANNULE
            ).count()
            rdv_par_mois.append({'mois': MOIS_FR[m - 1], 'total': total})

        # Docteurs les plus consultes
        docteurs_favoris = list(
            rdvs.exclude(statut=RendezVous.Statut.ANNULE)
            .values('docteur__id', 'docteur__user__first_name', 'docteur__user__last_name', 'docteur__specialite')
            .annotate(total=Count('id'))
            .order_by('-total')[:5]
        )

        return Response({
            'nb_rdv_a_venir': a_venir.count(),
            'nb_rdv_passes': passes.count(),
            'prochain_rdv': {
                'id': prochain.id,
                'docteur': str(prochain.docteur),
                'date_heure': prochain.date_heure,
            } if prochain else None,
            'rdv_par_mois': rdv_par_mois,
            'docteurs_favoris': [
                {
                    'docteur': f"Dr. {d['docteur__user__first_name']} {d['docteur__user__last_name']}",
                    'specialite': d['docteur__specialite'],
                    'total': d['total'],
                }
                for d in docteurs_favoris
            ],
        })


class DocteurDashboardView(APIView):
    permission_classes = [IsDocteur]

    def get(self, request):
        docteur = request.user.docteur_profile
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        rdvs = RendezVous.objects.filter(docteur=docteur)
        du_jour = rdvs.filter(date_heure__date=today)
        de_la_semaine = rdvs.filter(date_heure__date__range=[week_start, week_end])
        patients_uniques = rdvs.values('patient').distinct().count()

        # RDV par jour sur la semaine en cours (pour le graphique)
        rdv_par_jour = []
        for i in range(7):
            jour = week_start + timedelta(days=i)
            total = rdvs.filter(date_heure__date=jour).exclude(statut=RendezVous.Statut.ANNULE).count()
            rdv_par_jour.append({'jour': JOURS_FR[i], 'total': total})

        # Taux d'occupation simplifie : nb de creneaux de 30 min configures sur la
        # semaine (disponibilites) vs nb de RDV effectivement pris sur la semaine.
        DUREE_CRENEAU = 30
        creneaux_semaine = 0
        for plages in (docteur.disponibilites or {}).values():
            for plage in plages:
                try:
                    debut, fin = plage.split('-')
                    h1, m1 = (int(x) for x in debut.split(':'))
                    h2, m2 = (int(x) for x in fin.split(':'))
                    minutes = (h2 * 60 + m2) - (h1 * 60 + m1)
                    if minutes > 0:
                        creneaux_semaine += minutes // DUREE_CRENEAU
                except (ValueError, AttributeError):
                    continue
        rdv_confirmes_semaine = de_la_semaine.exclude(statut=RendezVous.Statut.ANNULE).count()
        taux_occupation = round((rdv_confirmes_semaine / creneaux_semaine) * 100, 1) if creneaux_semaine else 0

        # Derniers patients accueillis (RDV termines, les plus recents en premier)
        derniers_rdv = (
            rdvs.filter(statut=RendezVous.Statut.TERMINE)
            .select_related('patient__user')
            .order_by('-date_heure')[:5]
        )
        derniers_patients = [
            {
                'patient_id': r.patient_id,
                'nom': f'{r.patient.user.first_name} {r.patient.user.last_name}',
                'photo': request.build_absolute_uri(r.patient.photo.url) if r.patient.photo else None,
                'date_heure': r.date_heure,
                'motif': r.motif,
            }
            for r in derniers_rdv
        ]

        return Response({
            'rdv_du_jour': du_jour.count(),
            'rdv_de_la_semaine': de_la_semaine.count(),
            'patients_uniques': patients_uniques,
            'taux_occupation': taux_occupation,
            'rdv_par_jour': rdv_par_jour,
            'derniers_patients': derniers_patients,
            'est_disponible': docteur.est_disponible,
        })


class SecretaireDashboardView(APIView):
    permission_classes = [IsSecretaire]

    def get(self, request):
        today = date.today()
        rdvs = RendezVous.objects.all()

        rdv_par_jour = []
        for jour in _derniers_jours(7):
            total = rdvs.filter(date_heure__date=jour).exclude(statut=RendezVous.Statut.ANNULE).count()
            rdv_par_jour.append({'jour': jour.strftime('%d/%m'), 'total': total})

        return Response({
            'rdv_du_jour': rdvs.filter(date_heure__date=today).count(),
            'demandes_en_attente': rdvs.filter(statut=RendezVous.Statut.EN_ATTENTE).count(),
            'nouveaux_patients_7j': Patient.objects.filter(
                created_at__date__gte=today - timedelta(days=7)
            ).count(),
            'rdv_par_jour': rdv_par_jour,
            'rdv_par_statut': list(rdvs.values('statut').annotate(total=Count('id'))),
        })


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        rdvs = RendezVous.objects.all()

        rdv_par_jour = []
        for jour in _derniers_jours(14):
            total = rdvs.filter(date_heure__date=jour).exclude(statut=RendezVous.Statut.ANNULE).count()
            rdv_par_jour.append({'jour': jour.strftime('%d/%m'), 'total': total})

        return Response({
            'total_patients': Patient.objects.count(),
            'total_docteurs': Docteur.objects.count(),
            'total_secretaires': User.objects.filter(role=User.Role.SECRETAIRE).count(),
            'total_rendezvous': rdvs.count(),
            'rdv_par_statut': list(rdvs.values('statut').annotate(total=Count('id'))),
            'rdv_par_specialite': list(
                rdvs.values('docteur__specialite').annotate(total=Count('id'))
            ),
            'rdv_par_jour': rdv_par_jour,
        })
