from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, MyPatientProfileView

router = DefaultRouter()
router.register('', PatientViewSet, basename='patients')

urlpatterns = [
    path('me/', MyPatientProfileView.as_view(), name='patient-me'),
] + router.urls
