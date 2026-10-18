# Wajba — Gestion restaurant commandes

Application web de gestion des commandes d'un restaurant : menu, tables, commandes envoyées en cuisine et addition.
Projet de module **Programmation Web Dynamique S5 (IL)** — Faculté des Sciences d'Agadir, Université Ibn Zohr. Projet individuel.

## Technologies

- **Frontend** : React (dossier `frontend/`)
- **Backend** : Laravel 12 + Laravel Sanctum (dossier `backend/`)
- **Base de données** : MySQL

## Structure du dépôt

```
Projet-web28/
├── frontend/   (React)
├── backend/    (Laravel)
└── README.md
```

## Installation du backend

Prérequis : PHP 8.2 ou plus, Composer, MySQL (XAMPP, Laragon ou équivalent).

```bash
cd backend
composer install
cp .env.example .env          # sous Windows : copy .env.example .env
php artisan key:generate
```

1. Créer une base MySQL vide nommée `wajba` (phpMyAdmin ou `CREATE DATABASE wajba;`).
2. Vérifier `DB_USERNAME` et `DB_PASSWORD` dans `.env`.

```bash
php artisan migrate --seed    # crée les tables et les données de démonstration
php artisan serve             # API disponible sur http://localhost:8000/api
```

## Comptes de démonstration

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Gérant | gerant@wajba.ma | password123 |
| Serveur | serveur@wajba.ma | password123 |

## Tests

- **Tests automatisés Laravel** : `cd backend && php artisan test` (nécessite l'extension PHP `pdo_sqlite`).
- **Tests Postman** : importer `backend/postman/Wajba.postman_collection.json`, vérifier la variable `base_url` (`http://localhost:8000/api`), puis lancer la collection avec le Collection Runner, dans l'ordre. La base doit avoir été remplie avec `php artisan migrate --seed`.

## Routes principales de l'API

| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/register`, `/api/login` | public |
| POST | `/api/logout` ; GET `/api/me` | connecté |
| GET | `/api/menus`, `/api/tables` | Serveur et Gérant |
| POST, PUT, PATCH, DELETE | `/api/menus`, `/api/tables` | Gérant |
| GET, POST, PUT, DELETE | `/api/commandes` | Serveur et Gérant |
| PATCH | `/api/commandes/{id}/statut` | Serveur et Gérant |
| POST | `/api/commandes/{id}/addition`, `/paiement` ; PATCH `/remise` | Serveur et Gérant |
| GET, PUT, DELETE | `/api/serveurs` | Gérant |
| GET | `/api/dashboard` | Gérant |

Toutes les routes protégées attendent l'en-tête `Authorization: Bearer <jeton>`.
