from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """Notifications de l'utilisateur connecte uniquement."""
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def lue(self, request, pk=None):
        notif = self.get_object()
        notif.lu = True
        notif.save(update_fields=['lu'])
        return Response(NotificationSerializer(notif).data)

    @action(detail=False, methods=['patch'], url_path='tout-lire')
    def tout_lire(self, request):
        self.get_queryset().filter(lu=False).update(lu=True)
        return Response(status=status.HTTP_204_NO_CONTENT)
