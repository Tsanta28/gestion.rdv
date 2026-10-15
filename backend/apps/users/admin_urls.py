from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import AdminUserViewSet, AdminStatsView

router = DefaultRouter()
router.register('utilisateurs', AdminUserViewSet, basename='admin-utilisateurs')

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
] + router.urls
