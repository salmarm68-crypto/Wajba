#!/bin/sh
set -e
cd /var/www/html

# Fichier .env et clé de l'application
[ -f .env ] || cp .env.example .env
if ! grep -q '^APP_KEY=base64' .env; then
  php artisan key:generate --force
fi

# Dossiers d'écriture de Laravel
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

# Tables et données de démonstration (le seeder ne s'exécute qu'une seule fois)
php artisan migrate --force --seed

exec "$@"
