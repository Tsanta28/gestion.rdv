from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .permissions import IsAdmin
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, StaffCreateSerializer,
)


class RegisterView(generics.CreateAPIView):
    """Inscription publique - toujours role patient."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.get_tokens(serializer.validated_data['user'])
        return Response(data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not old_password or not new_password:
            return Response({'detail': 'old_password et new_password sont requis.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 6:
            return Response({'detail': 'Le nouveau mot de passe doit contenir au moins 6 caractères.'}, status=status.HTTP_400_BAD_REQUEST)
        if not request.user.check_password(old_password):
            return Response({'detail': "L'ancien mot de passe est incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new_password)
        request.user.save()
        return Response({'detail': 'Mot de passe modifié avec succès.'})


class AdminUserViewSet(viewsets.ModelViewSet):
    """Gestion complete des utilisateurs - reservee a l'admin."""
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return StaffCreateSerializer
        return UserSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        return qs

    @action(detail=True, methods=['patch'])
    def activer(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        return Response(UserSerializer(user).data)


class AdminStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from apps.patients.models import Patient
        from apps.docteurs.models import Docteur
        from apps.rendezvous.models import RendezVous

        return Response({
            'total_utilisateurs': User.objects.count(),
            'total_patients': Patient.objects.count(),
            'total_docteurs': Docteur.objects.count(),
            'total_secretaires': User.objects.filter(role=User.Role.SECRETAIRE).count(),
            'total_rendezvous': RendezVous.objects.count(),
            'rdv_par_statut': dict(
                RendezVous.objects.values_list('statut').annotate(
                    __import__('django.db.models', fromlist=['Count']).Count('id')
                )
            ) if False else _rdv_par_statut(),
        })


def _rdv_par_statut():
    from django.db.models import Count
    from apps.rendezvous.models import RendezVous
    rows = RendezVous.objects.values('statut').annotate(total=Count('id'))
    return {r['statut']: r['total'] for r in rows}
