import json
from rest_framework import serializers
from apps.users.models import User
from apps.users.serializers import UserSerializer
from .models import Docteur


class FlexibleJSONField(serializers.JSONField):
    """Accepte un objet JSON natif (requete JSON classique) ou une chaine
    JSON (cas d'un envoi multipart/form-data, ex: upload de photo en meme
    temps que la mise a jour des disponibilites)."""
    def to_internal_value(self, data):
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except (TypeError, ValueError):
                self.fail('invalid')
        return data

# Champs sensibles : uniquement visibles par l'admin, la secretaire, ou le
# docteur lui-meme (pas par les patients). Le patient ne voit que le badge
# "est_disponible" et reserve via l'endpoint dedie /creneaux-libres/.
CHAMPS_DISPONIBILITE_RESTREINTS = ['disponibilite', 'disponibilites']


def _peut_voir_disponibilite(request, docteur):
    if request is None or not request.user or not request.user.is_authenticated:
        return False
    u = request.user
    if u.is_admin or u.is_secretaire:
        return True
    if u.is_docteur and docteur.user_id == u.id:
        return True
    return False


class DocteurSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    photo = serializers.SerializerMethodField()

    class Meta:
        model = Docteur
        fields = [
            'id', 'user', 'specialite', 'numero_ordre', 'biographie',
            'description', 'disponibilite', 'photo', 'disponibilites', 'est_disponible',
        ]
        read_only_fields = ['id']

    def get_photo(self, obj):
        if not obj.photo:
            return None
        request = self.context.get('request')
        url = obj.photo.url
        return request.build_absolute_uri(url) if request else url

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if not _peut_voir_disponibilite(request, instance):
            for champ in CHAMPS_DISPONIBILITE_RESTREINTS:
                data.pop(champ, None)
        return data


class DocteurCreateSerializer(serializers.ModelSerializer):
    """Creation d'un docteur (User + profil) - reservee a l'admin."""
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Docteur
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name', 'phone',
            'specialite', 'numero_ordre', 'biographie', 'description',
            'disponibilite', 'photo', 'disponibilites', 'est_disponible',
        ]

    def create(self, validated_data):
        user_fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone']
        user_data = {f: validated_data.pop(f) for f in user_fields if f in validated_data}
        password = user_data.pop('password')
        user = User(role=User.Role.DOCTEUR, **user_data)
        user.set_password(password)
        user.save()
        return Docteur.objects.create(user=user, **validated_data)


class DocteurUpdateSerializer(serializers.ModelSerializer):
    """Mise a jour d'un docteur (par l'admin OU par le docteur lui-meme sur son profil) :
    champs du profil metier + nom/mot de passe optionnels du User lie."""
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=6)
    photo = serializers.ImageField(required=False, allow_null=True)
    disponibilites = FlexibleJSONField(required=False)

    class Meta:
        model = Docteur
        fields = [
            'id', 'first_name', 'last_name', 'phone', 'password',
            'specialite', 'numero_ordre', 'biographie', 'description',
            'disponibilite', 'photo', 'disponibilites', 'est_disponible',
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
