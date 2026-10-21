from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('apps.users.urls')),
    path('api/admin/', include('apps.users.admin_urls')),
    path('api/secretaire/', include('apps.users.secretaire_urls')),
    path('api/patients/', include('apps.patients.urls')),
    path('api/docteurs/', include('apps.docteurs.urls')),
    path('api/rendezvous/', include('apps.rendezvous.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/agenda/', include('apps.agenda.urls')),
    path('api/', include('apps.consultations.urls')),
    path('api/notifications/', include('apps.notifications.urls')),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
