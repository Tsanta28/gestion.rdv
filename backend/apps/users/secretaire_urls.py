from django.urls import path, include
from .secretaire_views import DocteursDisponiblesView

urlpatterns = [
    # Reutilise les ViewSets patients/rendezvous existants (deja filtres par permission IsSecretaire en ecriture)
    path('patients/', include('apps.patients.urls')),
    path('rendezvous/', include('apps.rendezvous.urls')),
    path('docteurs/disponibles/', DocteursDisponiblesView.as_view(), name='secretaire-docteurs-disponibles'),
    path('dashboard/', include('apps.dashboard.urls')),
]
