from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.permissions import IsAdmin, IsDocteur
from .models import Docteur
from .serializers import DocteurSerializer, DocteurCreateSerializer, DocteurUpdateSerializer


class DocteurViewSet(viewsets.ModelViewSet):
    queryset = Docteur.objects.select_related('user').all()

    def get_serializer_class(self):
        if self.action == 'create':
            return DocteurCreateSerializer
        if self.action in ['update', 'partial_update']:
            return DocteurUpdateSerializer
        return DocteurSerializer

    def get_permissions(self):
        # Lecture publique aux connectes; creation/modif/suppression = admin
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        specialite = self.request.query_params.get('specialite')
        if specialite:
            qs = qs.filter(specialite__iexact=specialite)
        u = self.request.user
        if u.is_authenticated and u.is_docteur:
            qs = qs.filter(user=u)
        return qs

    @action(detail=True, methods=['get'], url_path='creneaux-libres')
    def creneaux_libres(self, request, pk=None):
        """GET /api/docteurs/{id}/creneaux-libres/?date=AAAA-MM-JJ"""
        import datetime
        from apps.rendezvous.models import RendezVous

        date = request.query_params.get('date')
        if not date:
            return Response({'detail': 'Le parametre date est requis.'}, status=400)
        try:
            d = datetime.date.fromisoformat(date)
        except ValueError:
            return Response({'detail': 'Format de date invalide (AAAA-MM-JJ).'}, status=400)

        docteur = self.get_object()
        jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
        jour_nom = jours[d.weekday()]
        creneaux_jour = docteur.disponibilites.get(jour_nom, [])

        rdv_pris = RendezVous.objects.filter(
            docteur=docteur, date_heure__date=date,
        ).exclude(statut__in=[RendezVous.Statut.ANNULE, RendezVous.Statut.REFUSE]).values_list('date_heure', flat=True)
        heures_prises = {dt.strftime('%H:%M') for dt in rdv_pris}

        return Response({
            'docteur': docteur.id,
            'date': date,
            'creneaux_configures': creneaux_jour,
            'heures_deja_prises': sorted(heures_prises),
        })


class MyDocteurProfileView(APIView):
    """GET/PUT /api/docteurs/me/ - profil du docteur connecte (avec photo)."""
    permission_classes = [IsAuthenticated, IsDocteur]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        try:
            docteur = request.user.docteur_profile
        except Docteur.DoesNotExist:
            return Response({'detail': 'Aucun profil docteur.'}, status=404)
        return Response(DocteurSerializer(docteur, context={'request': request}).data)

    def put(self, request):
        try:
            docteur = request.user.docteur_profile
        except Docteur.DoesNotExist:
            return Response({'detail': 'Aucun profil docteur.'}, status=404)
        serializer = DocteurUpdateSerializer(docteur, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(DocteurSerializer(docteur, context={'request': request}).data)
