from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.permissions import IsDocteur, IsPatient
from apps.patients.models import Patient
from apps.patients.serializers import PatientSerializer
from apps.rendezvous.models import RendezVous
from apps.rendezvous.serializers import RendezVousSerializer
from apps.docteurs.serializers import DocteurSerializer
from .models import Consultation
from .serializers import ConsultationSerializer


class DocteurPatientDetailView(APIView):
    """
    GET /api/docteur/patients/{id}/details/
    Infos du patient + historique des RDV avec CE docteur + derniere consultation.
    Reserve au docteur connecte, uniquement pour ses propres patients.
    """
    permission_classes = [IsAuthenticated, IsDocteur]

    def get(self, request, patient_id):
        docteur = request.user.docteur_profile
        try:
            patient = Patient.objects.select_related('user').get(pk=patient_id)
        except Patient.DoesNotExist:
            return Response({'detail': 'Patient introuvable.'}, status=404)

        rdvs = RendezVous.objects.filter(docteur=docteur, patient=patient).select_related(
            'patient__user', 'docteur__user', 'consultation',
        ).order_by('-date_heure')

        if not rdvs.exists():
            return Response({'detail': "Ce patient n'a aucun rendez-vous avec vous."}, status=403)

        derniere_rdv_terminee = rdvs.filter(statut=RendezVous.Statut.TERMINE).first()
        derniere_consultation = None
        if derniere_rdv_terminee and hasattr(derniere_rdv_terminee, 'consultation'):
            derniere_consultation = ConsultationSerializer(derniere_rdv_terminee.consultation).data

        historique = []
        for rdv in rdvs:
            entry = RendezVousSerializer(rdv).data
            if hasattr(rdv, 'consultation'):
                entry['consultation'] = ConsultationSerializer(rdv.consultation).data
            historique.append(entry)

        return Response({
            'patient': PatientSerializer(patient, context={'request': request}).data,
            'derniere_consultation': derniere_consultation,
            'historique': historique,
        })


class PatientMesConsultationsView(APIView):
    """
    GET /api/patient/mes-consultations/
    Pour le patient connecte : la derniere consultation par docteur consulte.
    """
    permission_classes = [IsAuthenticated, IsPatient]

    def get(self, request):
        try:
            patient = request.user.patient_profile
        except Patient.DoesNotExist:
            return Response({'detail': 'Aucun profil patient.'}, status=404)

        docteur_ids = (
            RendezVous.objects.filter(patient=patient)
            .exclude(statut__in=[RendezVous.Statut.ANNULE, RendezVous.Statut.REFUSE])
            .values_list('docteur_id', flat=True).distinct()
        )

        from apps.docteurs.models import Docteur
        resultats = []
        for docteur in Docteur.objects.filter(id__in=docteur_ids).select_related('user'):
            derniere_rdv = (
                RendezVous.objects.filter(patient=patient, docteur=docteur, statut=RendezVous.Statut.TERMINE)
                .select_related('consultation').order_by('-date_heure').first()
            )
            consultation_data = None
            if derniere_rdv and hasattr(derniere_rdv, 'consultation'):
                consultation_data = ConsultationSerializer(derniere_rdv.consultation).data

            resultats.append({
                'docteur': DocteurSerializer(docteur, context={'request': request}).data,
                'derniere_consultation': consultation_data,
            })

        return Response(resultats)
