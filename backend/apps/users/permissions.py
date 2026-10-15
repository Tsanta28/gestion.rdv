from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class IsSecretaire(BasePermission):
    """Secretaire ou admin."""
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.is_secretaire or u.is_admin))


class IsDocteur(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.is_docteur)


class IsPatient(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.is_patient)


class IsOwnerOrAdminOrStaff(BasePermission):
    """
    Autorise l'admin et la secretaire pour tout, le docteur/patient
    uniquement sur les objets qui les concernent (obj.user ou obj lie).
    Chaque vue definit get_owner(obj) via une methode utilitaire si besoin.
    """
    def has_object_permission(self, request, view, obj):
        u = request.user
        if u.is_admin or u.is_secretaire:
            return True
        owner = getattr(obj, 'user', None)
        return owner == u
