from django.conf import settings
from django.db import models


class Docteur(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='docteur_profile')
    specialite = models.CharField(max_length=100)
    numero_ordre = models.CharField(max_length=50, unique=True)
    biographie = models.TextField(blank=True)
    description = models.TextField(blank=True, help_text="Parcours, approche du docteur, etc.")
    disponibilite = models.TextField(
        blank=True,
        help_text="Texte libre affiche au profil, ex : 'Lundi-Vendredi 08h-17h, Samedi 09h-12h'",
    )
    photo = models.ImageField(upload_to='docteurs/photos/', null=True, blank=True)
    est_disponible = models.BooleanField(
        default=True,
        help_text="Indicateur actif/inactif gere par le docteur lui-meme (ex: en conge, indisponible).",
    )
    disponibilites = models.JSONField(default=dict, blank=True)
    # Structure interne utilisee par la logique de planification (creneaux
    # disponibles / occupation) : {"lundi": ["08:00-12:00", ...], ...}
    # Distincte du champ "disponibilite" (texte libre affiche au profil).

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'Dr. {self.user.get_full_name() or self.user.username} ({self.specialite})'
