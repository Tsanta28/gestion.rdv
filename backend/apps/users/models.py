from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Administrateur'
        SECRETAIRE = 'secretaire', 'Secretaire'
        DOCTEUR = 'docteur', 'Docteur'
        PATIENT = 'patient', 'Patient'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PATIENT)
    phone = models.CharField(max_length=30, blank=True)
    address = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.role})'

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_secretaire(self):
        return self.role == self.Role.SECRETAIRE

    @property
    def is_docteur(self):
        return self.role == self.Role.DOCTEUR

    @property
    def is_patient(self):
        return self.role == self.Role.PATIENT
