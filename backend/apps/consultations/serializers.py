from rest_framework import serializers
from .models import Consultation


class ConsultationSerializer(serializers.ModelSerializer):
    date_heure = serializers.DateTimeField(source='rendezvous.date_heure', read_only=True)
    motif = serializers.CharField(source='rendezvous.motif', read_only=True)

    class Meta:
        model = Consultation
        fields = ['id', 'rendezvous', 'date_heure', 'motif', 'diagnostic', 'notes', 'prescription', 'created_at']
        read_only_fields = ['id', 'created_at']
