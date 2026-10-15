from django.conf import settings
from django.db import models


class RendezVous(models.Model):
    class Statut(models.TextChoices):
        DEMANDE_ENVOYEE = 'demande_envoyee', 'Demande envoyée'
        EN_ATTENTE = 'en_attente', 'En attente'
        PROPOSITION_ENVOYEE = 'proposition_envoyee', 'Proposition envoyée'
        CONFIRME = 'confirme', 'Confirmé'
        REFUSE = 'refuse', 'Refusé'
        ANNULE = 'annule', 'Annulé'
        TERMINE = 'termine', 'Terminé'

    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='rendezvous')
    docteur = models.ForeignKey('docteurs.Docteur', on_delete=models.CASCADE, related_name='rendezvous')
    date_heure = models.DateTimeField()
    duree = models.PositiveIntegerField(default=30, help_text='Duree en minutes')
    motif = models.TextField(blank=True)
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    notes_docteur = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='rendezvous_crees',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_heure']

    def __str__(self):
        return f'RDV {self.patient} avec {self.docteur} le {self.date_heure}'


class CreneauDisponible(models.Model):
    docteur = models.ForeignKey('docteurs.Docteur', on_delete=models.CASCADE, related_name='creneaux')
    date = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    est_reserve = models.BooleanField(default=False)

    class Meta:
        ordering = ['date', 'heure_debut']

    def __str__(self):
        return f'{self.docteur} - {self.date} {self.heure_debut}-{self.heure_fin}'


class PropositionCreneau(models.Model):
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        ACCEPTEE = 'acceptee', 'Acceptée'
        REFUSEE = 'refusee', 'Refusée'

    rendezvous = models.ForeignKey(RendezVous, on_delete=models.CASCADE, related_name='propositions')
    date_heure_proposee = models.DateTimeField()
    propose_par = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date_heure_proposee']

    def __str__(self):
        return f'Proposition pour RDV #{self.rendezvous_id} - {self.date_heure_proposee}'
