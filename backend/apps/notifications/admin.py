from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'type', 'lu', 'created_at']
    list_filter = ['type', 'lu']
