from django.urls import path
from .views import AgendaDocteurView, AgendaTousView, AgendaPatientView

urlpatterns = [
    path('docteur/<int:docteur_id>/', AgendaDocteurView.as_view(), name='agenda-docteur'),
    path('tous/', AgendaTousView.as_view(), name='agenda-tous'),
    path('patient/', AgendaPatientView.as_view(), name='agenda-patient'),
]
