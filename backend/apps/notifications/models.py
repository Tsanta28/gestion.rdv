from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        INFO = 'info', 'Information'
        SUCCESS = 'success', 'Succes'
        WARNING = 'warning', 'Avertissement'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.INFO)
    rendezvous = models.ForeignKey(
        'rendezvous.RendezVous', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications',
    )
    lu = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} - {self.message}'
