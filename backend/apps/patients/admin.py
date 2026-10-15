from django.contrib import admin
from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['user', 'sexe', 'groupe_sanguin', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
