
## Comptes de test (crees par `seed_data`)

| Role        | Identifiant (username) | Email                   | Mot de passe |
|-------------|-------------------------|--------------------------|--------------|
| Admin       | admin                   | admin@clinique.com      | Admin@123    |
| Secretaire  | secretaire1             | secretaire@clinique.com | Sec@123      |
| Docteur     | dr.martin               | dr.martin@clinique.com  | Doc@123      |
| Docteur     | dr.dupont               | dr.dupont@clinique.com  | Doc@123      |
| Patient     | patient1                | patient1@mail.com       | Pat@123      |
| Patient     | patient2                | patient2@mail.com       | Pat@123      |
| Patient     | patient3                | patient3@mail.com       | Pat@123      |
-----------------------------------------------------------------------------------


## 1. Stack technique

### Backend
| Composant | Technologie |
|---|---|
| Framework | Django 5.0 + Django REST Framework 3.15 |
| Authentification | JWT via `djangorestframework-simplejwt` (access + refresh token, blacklist au logout) |
| Base de données | SQLite (fichier `db.sqlite3`, par défaut — changeable via `DATABASES` dans `settings.py`) |
| Upload d'images | Pillow (photos docteur/patient, servies via `MEDIA_URL`/`MEDIA_ROOT`) |
| CORS | `django-cors-headers` |
| Documentation API | `drf-spectacular` (Swagger sur `/api/docs/`, Redoc sur `/api/redoc/`) |
| Config | `python-decouple` (variables d'environnement via `.env`) |

### Frontend
| Composant | Technologie |
|---|---|
| Framework | React 18 + Vite 5 |
| Style | Tailwind CSS 3 (mode sombre via classe `dark`) |
| Routage | React Router DOM 6 |
| Requêtes HTTP | Axios (intercepteur JWT + refresh automatique) |
| Formulaires | React Hook Form + Zod (validation) |
| Graphiques | Recharts |
| Calendrier | React Big Calendar + date-fns |
| Icônes | lucide-react |
| Animations | Framer Motion |
| Notifications (toasts) | react-hot-toast |

---

## 2. Structure de la base de données

Le schéma est organisé en 7 apps Django, chacune avec ses propres modèles et migrations.

### `users` — Utilisateur personnalisé
Hérite de `AbstractUser` (Django) ; **un seul modèle User pour les 4 rôles**, distingués par le champ `role`.

| Champ | Type | Détail |
|---|---|---|
| `role` | choix | `admin` / `secretaire` / `docteur` / `patient` (défaut `patient`) |
| `phone` | texte | — |
| `address` | texte | — |
| *(hérités)* | — | `username`, `email`, `password`, `first_name`, `last_name`, `is_active`, `is_staff`, `is_superuser`, `date_joined` |

### `patients` — Profil patient
Relation **1-to-1** avec `User`.

| Champ | Type | Détail |
|---|---|---|
| `user` | OneToOne → User | `related_name='patient_profile'` |
| `date_naissance` | date | optionnel |
| `sexe` | choix | `M` / `F` |
| `groupe_sanguin` | texte court | — |
| `antecedents_medicaux` | texte long | — |
| `numero_assurance` | texte court | — |
| `photo` | image | `patients/photos/` |
| `created_by` | FK → User | qui a créé la fiche (secrétaire/admin), null si auto-inscription |
| `created_at` | date/heure | auto |

### `docteurs` — Profil docteur
Relation **1-to-1** avec `User`.

| Champ | Type | Détail |
|---|---|---|
| `user` | OneToOne → User | `related_name='docteur_profile'` |
| `specialite` | texte | liste fermée côté frontend (13 spécialités + "Autre") |
| `numero_ordre` | texte | **unique** |
| `biographie` | texte long | legacy, peu utilisé |
| `description` | texte long | parcours/approche, affiché aux patients |
| `disponibilite` | texte libre | résumé affiché aux patients (ex. "Lun-Ven 08h-17h"), **visible uniquement par admin/secrétaire/le docteur lui-même** |
| `disponibilites` | JSON | planning structuré interne `{"lundi": ["08:00-12:00", ...], ...}` utilisé pour calculer les créneaux libres — même restriction de visibilité |
| `photo` | image | `docteurs/photos/` |
| `est_disponible` | booléen | indicateur actif/inactif géré par le docteur (visible de tous) |

### `rendezvous` — Rendez-vous + modèles liés

**`RendezVous`**
| Champ | Type | Détail |
|---|---|---|
| `patient` | FK → Patient | |
| `docteur` | FK → Docteur | |
| `date_heure` | date/heure | **doit être future** (validée au niveau serializer) |
| `duree` | entier | minutes, défaut 30 |
| `motif` | texte | |
| `statut` | choix | voir workflow ci-dessous |
| `notes_docteur` | texte | |
| `created_by` | FK → User | patient, secrétaire ou admin |
| `created_at` / `updated_at` | date/heure | auto |

Statuts possibles : `demande_envoyee` → `en_attente` (legacy) → `proposition_envoyee` → `confirme` / `refuse` / `annule` / `termine`.

**`PropositionCreneau`** (1 RDV → plusieurs propositions)
`rendezvous` (FK), `date_heure_proposee`, `propose_par` (FK User), `statut` (`en_attente`/`acceptee`/`refusee`), `created_at`.

**`CreneauDisponible`** — modèle prévu pour un futur système de créneaux pré-déclarés (non utilisé activement ; le calcul des disponibilités passe aujourd'hui par `Docteur.disponibilites` + les RDV existants).

### `consultations` — Compte-rendu médical
Relation **1-to-1** avec `RendezVous`.

| Champ | Type |
|---|---|
| `rendezvous` | OneToOne → RendezVous |
| `diagnostic` | texte long |
| `notes` | texte long |
| `prescription` | texte long |
| `created_at` / `updated_at` | auto |

### `notifications` — Notifications in-app
| Champ | Type | Détail |
|---|---|---|
| `user` | FK → User | destinataire |
| `message` | texte court | |
| `type` | choix | `info` / `success` / `warning` |
| `rendezvous` | FK → RendezVous | nullable, pour lien direct |
| `lu` | booléen | |
| `created_at` | date/heure | |

### Schéma relationnel simplifié
```
User (role: admin|secretaire|docteur|patient)
 ├──1:1── Patient ──1:N── RendezVous ──N:1── Docteur ──1:1── User
 │                          │
 │                          ├──1:1── Consultation
 │                          └──1:N── PropositionCreneau
 └──1:N── Notification (FK optionnelle vers RendezVous)
```

---

## 3. Rôles et permissions (résumé)

| Action | Patient | Secrétaire | Docteur | Admin |
|---|---|---|---|---|
| Créer une demande de RDV | ✅ (pour soi) | ✅ (pour un patient) | — | — |
| Valider / refuser / proposer un créneau | — | ✅ | ✅ (son propre RDV) | — |
| Réassigner à un autre docteur | — | ✅ | — | ✅ |
| Voir le planning détaillé d'un docteur | ❌ | ✅ | ✅ (le sien) | ✅ |
| Voir/modifier son propre profil | ✅ | ✅ | ✅ | ✅ |
| Gérer les utilisateurs (CRUD) | ❌ | partiel (patients) | ❌ | ✅ |
| Valider une inscription patient | ❌ | ✅ | ❌ | ✅ (via toggle actif) |

---

## 4. Workflow de prise de rendez-vous

1. **Demande** : le patient (directement) ou la secrétaire (au nom d'un patient) crée un RDV → statut `demande_envoyee`.
2. **Réponse du docteur** :
   - **Accepte** → `confirme` (notification au patient)
   - **Refuse** → `refuse` (notification au patient)
   - **Propose un/des créneau(x)** → `proposition_envoyee` (1 à 3 `PropositionCreneau`, notification au patient)
3. **Réponse du patient à une proposition** :
   - **Accepte** un créneau → `confirme`, `date_heure` mise à jour (notification au docteur)
   - **Refuse** → `annule`
4. **Après la consultation** : le docteur passe le RDV à `termine` et peut y attacher une `Consultation` (diagnostic/notes/prescription).
5. **Inscription patient** : un compte créé via `/register` est **inactif** (`is_active=False`) jusqu'à validation par une secrétaire (`PATCH /api/patients/{id}/valider/`).

---

