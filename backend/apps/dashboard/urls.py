from django.urls import path
from .views import (
    PatientDashboardView, DocteurDashboardView, SecretaireDashboardView, AdminDashboardView,
)

urlpatterns = [
    path('patient/', PatientDashboardView.as_view(), name='dashboard-patient'),
    path('docteur/', DocteurDashboardView.as_view(), name='dashboard-docteur'),
    path('secretaire/', SecretaireDashboardView.as_view(), name='dashboard-secretaire'),
    path('admin/', AdminDashboardView.as_view(), name='dashboard-admin'),
]
