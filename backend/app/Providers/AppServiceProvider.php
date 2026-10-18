<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // La table des jetons est créée par notre propre migration.
        if (method_exists(Sanctum::class, 'ignoreMigrations')) {
            Sanctum::ignoreMigrations();
        }
    }

    public function boot(): void
    {
        //
    }
}
