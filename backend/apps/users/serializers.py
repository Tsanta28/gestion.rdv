from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'address', 'date_joined', 'is_active',
        ]
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password',
            'first_name', 'last_name', 'phone', 'address',
        ]

    def create(self, validated_data):
        # Inscription publique = toujours role patient, et le compte reste
        # inactif tant que la secretaire n'a pas valide l'inscription.
        from apps.patients.models import Patient

        password = validated_data.pop('password')
        user = User(role=User.Role.PATIENT, is_active=False, **validated_data)
        user.set_password(password)
        user.save()
        # Le profil Patient doit exister des la creation, sinon la prise de
        # RDV et les autres fonctionnalites patient echouent une fois le
        # compte valide.
        Patient.objects.create(user=user)
        return user


class StaffCreateSerializer(serializers.ModelSerializer):
    """Utilise par l'admin pour creer secretaire / docteur / admin."""
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password',
            'first_name', 'last_name', 'phone', 'address', 'role',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        # authenticate() rejette silencieusement les comptes inactifs (il
        # renvoie None dans ce cas, comme pour un mauvais mot de passe) :
        # on ne peut donc pas distinguer "identifiants invalides" de
        # "compte en attente de validation" en passant uniquement par lui.
        # On verifie donc le mot de passe nous-memes si l'utilisateur
        # existe mais est inactif.
        user = authenticate(username=attrs['username'], password=attrs['password'])
        if not user:
            try:
                candidat = User.objects.get(username=attrs['username'])
            except User.DoesNotExist:
                candidat = None
            if candidat and not candidat.is_active and candidat.check_password(attrs['password']):
                if candidat.role == User.Role.PATIENT:
                    raise serializers.ValidationError(
                        "Votre inscription est en attente de validation par la secretaire. "
                        "Vous recevrez un acces des qu'elle aura ete verifiee."
                    )
                raise serializers.ValidationError('Ce compte est desactive.')
            raise serializers.ValidationError('Identifiants invalides.')
        attrs['user'] = user
        return attrs

    def get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
            'user': UserSerializer(user).data,
        }
