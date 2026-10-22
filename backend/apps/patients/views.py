from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.permissions import IsSecretaire, IsPatient
from .models import Patient
from .serializers import PatientSerializer, PatientCreateSerializer, PatientUpdateSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related('user').all()

    def get_serializer_class(self):
        if self.action == 'create':
            return PatientCreateSerializer
        if self.action in ['update', 'partial_update']:
            return PatientUpdateSerializer
        return PatientSerializer

    def get_permissions(self):
        # Lecture : tout utilisateur connecte. Ecriture : secretaire/admin.
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'valider']:
            return [IsSecretaire()]
        return super().get_permissions()

    def get_queryset(self):
        u = self.request.user
        qs = super().get_queryset()
        if u.is_patient:
            return qs.filter(user=u)
        if u.is_docteur:
            from apps.rendezvous.models import RendezVous
            patient_ids = RendezVous.objects.filter(docteur__user=u).values_list('patient_id', flat=True)
            return qs.filter(id__in=patient_ids)

        # Admin / secretaire : par defaut on masque les inscriptions en
        # attente de validation de la liste generale, sauf demande explicite
        # via ?statut=en_attente (ou ?statut=actif pour forcer l'inverse).
        statut = self.request.query_params.get('statut')
        if statut == 'en_attente':
            qs = qs.filter(user__is_active=False)
        elif statut == 'actif' or statut is None:
            qs = qs.filter(user__is_active=True)
        return qs

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['patch'])
    def valider(self, request, pk=None):
        """Valide l'inscription d'un patient auto-inscrit (active son compte)."""
        
        try:
            patient = Patient.objects.select_related('user').get(pk=pk)
        except Patient.DoesNotExist:
            return Response({'detail': 'Patient introuvable.'}, status=404)
        patient.user.is_active = True
        patient.user.save(update_fields=['is_active'])
        return Response(PatientSerializer(patient, context={'request': request}).data)


class MyPatientProfileView(APIView):
    """GET/PUT /api/patients/me/ - profil du patient connecte (avec photo)."""
    permission_classes = [IsAuthenticated, IsPatient]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        try:
            patient = request.user.patient_profile
        except Patient.DoesNotExist:
            return Response({'detail': 'Aucun profil patient.'}, status=404)
        return Response(PatientSerializer(patient, context={'request': request}).data)

    def put(self, request):
        try:
            patient = request.user.patient_profile
        except Patient.DoesNotExist:
            return Response({'detail': 'Aucun profil patient.'}, status=404)
        serializer = PatientUpdateSerializer(patient, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PatientSerializer(patient, context={'request': request}).data)
