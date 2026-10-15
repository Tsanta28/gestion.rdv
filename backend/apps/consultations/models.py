from django.db import models


class Consultation(models.Model):
    """Compte-rendu associe a un rendez-vous (en general 'termine')."""
    rendezvous = models.OneToOneField(
        'rendezvous.RendezVous', on_delete=models.CASCADE, related_name='consultation',
    )
    diagnostic = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    prescription = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Consultation RDV #{self.rendezvous_id}'
