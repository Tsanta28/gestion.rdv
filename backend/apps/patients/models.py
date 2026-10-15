from django.conf import settings
from django.db import models


class Patient(models.Model):
    class Sexe(models.TextChoices):
        M = 'M', 'Masculin'
        F = 'F', 'Feminin'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_profile')
    date_naissance = models.DateField(null=True, blank=True)
    sexe = models.CharField(max_length=1, choices=Sexe.choices, blank=True)
    groupe_sanguin = models.CharField(max_length=5, blank=True)
    antecedents_medicaux = models.TextField(blank=True)
    numero_assurance = models.CharField(max_length=50, blank=True)
    photo = models.ImageField(upload_to='patients/photos/', null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='patients_crees',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Patient: {self.user.get_full_name() or self.user.username}'
