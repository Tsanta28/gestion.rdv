from rest_framework import serializers
from apps.patients.serializers import PatientSerializer
from apps.docteurs.serializers import DocteurSerializer
from apps.patients.models import Patient
from apps.docteurs.models import Docteur
from .models import RendezVous, CreneauDisponible, PropositionCreneau


class PropositionCreneauSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropositionCreneau
        fields = ['id', 'rendezvous', 'date_heure_proposee', 'propose_par', 'statut', 'created_at']
        read_only_fields = ['id', 'rendezvous', 'propose_par', 'created_at']


class RendezVousSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    docteur = DocteurSerializer(read_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(), source='patient', write_only=True, required=False,
    )
    docteur_id = serializers.PrimaryKeyRelatedField(
        queryset=Docteur.objects.all(), source='docteur', write_only=True,
    )
    propositions = PropositionCreneauSerializer(many=True, read_only=True)
    a_consultation = serializers.SerializerMethodField()

    class Meta:
        model = RendezVous
        fields = [
            'id', 'patient', 'docteur', 'patient_id', 'docteur_id',
            'date_heure', 'duree', 'motif', 'statut', 'notes_docteur',
            'propositions', 'a_consultation',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_a_consultation(self, obj):
        return hasattr(obj, 'consultation')

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['created_by'] = request.user if request else None
        return super().create(validated_data)


class RendezVousStatutSerializer(serializers.ModelSerializer):
    class Meta:
        model = RendezVous
        fields = ['statut', 'notes_docteur']


class CreneauDisponibleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreneauDisponible
        fields = ['id', 'docteur', 'date', 'heure_debut', 'heure_fin', 'est_reserve']
