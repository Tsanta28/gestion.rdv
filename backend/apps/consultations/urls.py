from django.urls import path
from .views import DocteurPatientDetailView, PatientMesConsultationsView

urlpatterns = [
    path('docteur/patients/<int:patient_id>/details/', DocteurPatientDetailView.as_view(), name='docteur-patient-details'),
    path('patient/mes-consultations/', PatientMesConsultationsView.as_view(), name='patient-mes-consultations'),
]
