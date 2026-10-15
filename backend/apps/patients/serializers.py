from rest_framework import serializers
from apps.users.models import User
from apps.users.serializers import UserSerializer
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    photo = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'date_naissance', 'sexe', 'groupe_sanguin',
            'antecedents_medicaux', 'numero_assurance', 'photo', 'created_by', 'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def get_photo(self, obj):
        if not obj.photo:
            return None
        request = self.context.get('request')
        url = obj.photo.url
        return request.build_absolute_uri(url) if request else url


class PatientCreateSerializer(serializers.ModelSerializer):
    """Cree un User (role=patient) + son profil Patient d'un coup (secretaire/admin)."""
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Patient
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name', 'phone',
            'date_naissance', 'sexe', 'groupe_sanguin', 'antecedents_medicaux', 'numero_assurance',
        ]

    def create(self, validated_data):
        user_fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone']
        user_data = {f: validated_data.pop(f) for f in user_fields if f in validated_data}
        password = user_data.pop('password')
        user = User(role=User.Role.PATIENT, **user_data)
        user.set_password(password)
        user.save()
        request = self.context.get('request')
        patient = Patient.objects.create(
            user=user,
            created_by=request.user if request else None,
            **validated_data,
        )
        return patient


class PatientUpdateSerializer(serializers.ModelSerializer):
    """Mise a jour d'un patient (par la secretaire/admin OU par le patient
    lui-meme sur son propre profil) : champs metier + nom/telephone/mot de
    passe optionnels du User lie."""
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=6)
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Patient
        fields = [
            'id', 'first_name', 'last_name', 'phone', 'password',
            'date_naissance', 'sexe', 'groupe_sanguin',
            'antecedents_medicaux', 'numero_assurance', 'photo',
        ]

    def update(self, instance, validated_data):
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        phone = validated_data.pop('phone', None)
        password = validated_data.pop('password', None)
        if first_name is not None:
            instance.user.first_name = first_name
        if last_name is not None:
            instance.user.last_name = last_name
        if phone is not None:
            instance.user.phone = phone
        if password:
            instance.user.set_password(password)
        instance.user.save()
        return super().update(instance, validated_data)
