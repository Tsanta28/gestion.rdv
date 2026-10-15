from django.core.management.base import BaseCommand
from django.db import transaction
from apps.users.models import User
from apps.patients.models import Patient
from apps.docteurs.models import Docteur


class Command(BaseCommand):
    help = "Cree des comptes de demonstration (admin, secretaire, docteurs, patients)."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Suppression des anciennes donnees de demo (si presentes)...')

        # --- Admin ---
        admin, created = User.objects.get_or_create(
            username='admin', defaults={
                'email': 'admin@clinique.com', 'role': User.Role.ADMIN,
                'first_name': 'Admin', 'last_name': 'Clinique',
                'is_staff': True, 'is_superuser': True,
            },
        )
        if created:
            admin.set_password('Admin@123')
            admin.save()
        self.stdout.write(self.style.SUCCESS('Admin : admin@clinique.com / Admin@123'))

        # --- Secretaire ---
        secretaire, created = User.objects.get_or_create(
            username='secretaire1', defaults={
                'email': 'secretaire@clinique.com', 'role': User.Role.SECRETAIRE,
                'first_name': 'Sophie', 'last_name': 'Rakoto',
            },
        )
        if created:
            secretaire.set_password('Sec@123')
            secretaire.save()
        self.stdout.write(self.style.SUCCESS('Secretaire : secretaire@clinique.com / Sec@123'))

        # --- Docteurs ---
        docteurs_data = [
            ('dr.martin', 'dr.martin@clinique.com', 'Martin', 'Cardiologie', 'ORD-001'),
            ('dr.dupont', 'dr.dupont@clinique.com', 'Dupont', 'Pediatrie', 'ORD-002'),
        ]
        for username, email, nom, specialite, numero_ordre in docteurs_data:
            user, created = User.objects.get_or_create(
                username=username, defaults={
                    'email': email, 'role': User.Role.DOCTEUR,
                    'first_name': 'Dr.', 'last_name': nom,
                },
            )
            if created:
                user.set_password('Doc@123')
                user.save()
            Docteur.objects.get_or_create(
                user=user, defaults={
                    'specialite': specialite, 'numero_ordre': numero_ordre,
                    'description': f"Médecin spécialisé en {specialite.lower()}, à l'écoute de ses patients.",
                    'disponibilite': 'Lundi-Vendredi 08h-12h et 14h-17h',
                    'disponibilites': {
                        'lundi': ['08:00-12:00', '14:00-17:00'],
                        'mardi': ['08:00-12:00'],
                        'mercredi': ['08:00-12:00', '14:00-17:00'],
                        'jeudi': ['08:00-12:00'],
                        'vendredi': ['08:00-12:00'],
                    },
                },
            )
            self.stdout.write(self.style.SUCCESS(f'Docteur : {email} / Doc@123'))

        # --- Patients ---
        patients_data = [
            ('patient1', 'patient1@mail.com', 'Rasoa'),
            ('patient2', 'patient2@mail.com', 'Andry'),
            ('patient3', 'patient3@mail.com', 'Voahangy'),
        ]
        for username, email, nom in patients_data:
            user, created = User.objects.get_or_create(
                username=username, defaults={
                    'email': email, 'role': User.Role.PATIENT,
                    'first_name': nom, 'last_name': 'Test',
                },
            )
            if created:
                user.set_password('Pat@123')
                user.save()
            Patient.objects.get_or_create(user=user)
            self.stdout.write(self.style.SUCCESS(f'Patient : {email} / Pat@123'))

        self.stdout.write(self.style.SUCCESS('\nDonnees de demonstration creees avec succes.'))
