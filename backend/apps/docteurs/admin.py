from django.contrib import admin
from .models import Docteur


@admin.register(Docteur)
class DocteurAdmin(admin.ModelAdmin):
    list_display = ['user', 'specialite', 'numero_ordre']
    search_fields = ['user__username', 'specialite', 'numero_ordre']
