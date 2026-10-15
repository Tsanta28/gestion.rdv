from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import DocteurViewSet, MyDocteurProfileView

router = DefaultRouter()
router.register('', DocteurViewSet, basename='docteurs')

urlpatterns = [
    path('me/', MyDocteurProfileView.as_view(), name='docteur-me'),
] + router.urls
