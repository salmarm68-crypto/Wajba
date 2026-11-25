# Wajba — Gestion restaurant commandes

Application web de gestion des commandes d'un restaurant : menu, tables, commandes envoyées en cuisine et addition.
Projet de module **Programmation Web Dynamique S5 (IL)** — Faculté des Sciences d'Agadir, Université Ibn Zohr. Projet individuel.

## Technologies

- **Frontend** : React (Vite), React Router, TanStack Query, Tailwind CSS, Axios, react-i18next (dossier `frontend/`)
- **Backend** : Laravel 12 + Laravel Sanctum (dossier `backend/`)
- **Base de données** : MySQL
- **Tests** : PHPUnit (Laravel) et Postman
- **Conteneurs** : Docker et Docker Compose

## Fonctionnalités

- Authentification (inscription, connexion, déconnexion) avec deux rôles : **Serveur** et **Gérant**.
- Plan de salle avec le statut de chaque table (libre, en service, addition demandée).
- Prise de commande, modification, annulation et suivi des statuts (en attente, en préparation, prête, servie).
- Écran cuisine avec actualisation automatique.
- Addition (remise, TVA 10 %), paiement espèces ou carte, ticket imprimable, libération de la table.
- Gérant : gestion du menu, des tables et des serveurs, tableau de bord.
- Interface en **français** (par défaut) ou en **anglais**, thème **clair** (par défaut) ou **sombre** : le choix est mémorisé dans le navigateur.

## Structure du dépôt

```
Projet-web28/
├── frontend/            (React, avec son Dockerfile)
├── backend/             (Laravel, avec son Dockerfile)
├── docker-compose.yml   (MySQL + API + interface, lancement avec Docker)
└── README.md
```

## Lancement avec Docker (recommandé)

Prérequis : Docker Desktop (Windows ou Mac) ou Docker Engine avec le plugin Compose (Linux). Aucun autre outil à installer : PHP, Composer, Node et MySQL sont dans les conteneurs.

```bash
docker compose up --build
```

La première construction prend quelques minutes. Ensuite :

| Service | Adresse |
|---|---|
| Interface (React) | http://localhost:5173 |
| API (Laravel) | http://localhost:8000/api |
| MySQL (depuis la machine) | `127.0.0.1:3307`, base `wajba`, utilisateur `root`, mot de passe `root` |

Au démarrage, le conteneur `backend` crée le fichier `.env`, génère la clé de l'application, exécute les migrations et remplit la base avec les données de démonstration (une seule fois).

Commandes utiles :

```bash
docker compose up -d --build                  # lancer en arrière-plan
docker compose logs -f backend                # suivre les journaux de l'API
docker compose exec backend php artisan test  # tests Laravel (SQLite en mémoire : la base de démonstration n'est pas touchée)
docker compose down                           # arrêter
docker compose down -v                        # arrêter et effacer la base (repartir de zéro)
```

Services du fichier `docker-compose.yml` : `db` (MySQL 8), `backend` (PHP 8.3 et Laravel 12) et `frontend` (Node 22 et Vite).

## Installation sans Docker (Laragon, XAMPP...)

### Installation du backend

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

### Installation du frontend

Prérequis : Node.js 22 ou plus.

```bash
cd frontend
npm install
npm run dev                   # interface disponible sur http://localhost:5173
```

L'adresse de l'API est définie dans `frontend/.env` (`VITE_API_URL=http://localhost:8000/api`).

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
