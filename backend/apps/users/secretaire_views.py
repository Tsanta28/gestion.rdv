from rest_framework.views import APIView
from rest_framework.response import Response
from apps.users.permissions import IsSecretaire
from apps.docteurs.models import Docteur
from apps.docteurs.serializers import DocteurSerializer


class DocteursDisponiblesView(APIView):
    """Liste simplifiee des docteurs, utile pour la prise de RDV cote secretaire."""
    permission_classes = [IsSecretaire]

    def get(self, request):
        docteurs = Docteur.objects.select_related('user').filter(user__is_active=True)
        specialite = request.query_params.get('specialite')
        if specialite:
            docteurs = docteurs.filter(specialite__iexact=specialite)
        return Response(DocteurSerializer(docteurs, many=True).data)
