# Backend Wajba (Laravel 12)

API REST de l'application **Gestion restaurant commandes (Wajba)** : authentification (Sanctum), gestion du menu, des tables, des serveurs, des commandes, de la cuisine, de l'addition et du paiement.

Installation et lancement : voir le `README.md` à la racine du dépôt.

- Routes : `routes/api.php`
- Contrôleurs : `app/Http/Controllers`
- Règles de gestion : `app/Http/Controllers/CommandeController.php` et `app/Models/Commande.php`
- Migrations : `database/migrations` (d'après le modèle de données)
- Tests automatisés : `tests/Feature` (`php artisan test`)
- Tests Postman : `postman/Wajba.postman_collection.json`
