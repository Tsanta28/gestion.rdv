| Role        | Identifiant (username) | Email                   | Mot de passe |
|-------------|-------------------------|--------------------------|--------------|
| Admin       | admin                   | admin@clinique.com      | Admin@123    |
| Secretaire  | secretaire1             | secretaire@clinique.com | Sec@123      |
| Docteur     | dr.martin               | dr.martin@clinique.com  | Doc@123      |
| Docteur     | dr.dupont               | dr.dupont@clinique.com  | Doc@123      |
| Patient     | patient1                | patient1@mail.com       | Pat@123      |
| Patient     | patient2                | patient2@mail.com       | Pat@123      |
| Patient     | patient3                | patient3@mail.com       | Pat@123      |

## Authentification (JWT)

```
POST /api/auth/login/        {"username": "...", "password": "..."}  -> {access, refresh, role, user}
POST /api/auth/refresh/      {"refresh": "..."}
POST /api/auth/register/     inscription publique (toujours role=patient)
GET  /api/auth/me/           profil connecte
POST /api/auth/logout/       {"refresh": "..."}  (blackliste le refresh token)
```

## Principaux endpoints

- `/api/admin/utilisateurs/` — CRUD utilisateurs (admin uniquement)
- `/api/admin/stats/` — statistiques globales (admin)
- `/api/secretaire/patients/`, `/api/secretaire/rendezvous/`, `/api/secretaire/docteurs/disponibles/`
- `/api/patients/`, `/api/docteurs/`, `/api/rendezvous/`
- `/api/rendezvous/{id}/statut/` — PATCH pour changer le statut
- `/api/rendezvous/disponibles/?docteur={id}&date=AAAA-MM-JJ`
- `/api/dashboard/{admin|secretaire|docteur|patient}/`

Permissions par role appliquees via `apps/users/permissions.py`
(`IsAdmin`, `IsSecretaire`, `IsDocteur`, `IsPatient`).
