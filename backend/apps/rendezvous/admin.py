from django.contrib import admin
from .models import RendezVous, CreneauDisponible


@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    list_display = ['patient', 'docteur', 'date_heure', 'statut']
    list_filter = ['statut']
    search_fields = ['patient__user__username', 'docteur__user__username']


@admin.register(CreneauDisponible)
class CreneauDisponibleAdmin(admin.ModelAdmin):
    list_display = ['docteur', 'date', 'heure_debut', 'heure_fin', 'est_reserve']
