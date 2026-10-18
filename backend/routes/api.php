<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\ServeurController;
use App\Http\Controllers\TableController;
use Illuminate\Support\Facades\Route;

/*
| Routes de l'API Wajba (préfixe /api).
| - Publiques : inscription et connexion.
| - Authentifiées (jeton Sanctum) : Serveur et Gérant.
| - Réservées au Gérant : middleware role:gerant.
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:20,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Consultation du menu et du plan de salle (Serveur et Gérant)
    Route::get('/menus', [MenuController::class, 'index']);
    Route::get('/menus/{menu}', [MenuController::class, 'show']);
    Route::get('/tables', [TableController::class, 'index']);
    Route::get('/tables/{table}', [TableController::class, 'show']);

    // Commandes, cuisine, addition et paiement (Serveur et Gérant)
    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::post('/commandes', [CommandeController::class, 'store']);
    Route::get('/commandes/{commande}', [CommandeController::class, 'show']);
    Route::put('/commandes/{commande}', [CommandeController::class, 'update']);
    Route::delete('/commandes/{commande}', [CommandeController::class, 'destroy']);
    Route::patch('/commandes/{commande}/statut', [CommandeController::class, 'statut']);
    Route::post('/commandes/{commande}/addition', [CommandeController::class, 'addition']);
    Route::patch('/commandes/{commande}/remise', [CommandeController::class, 'remise']);
    Route::post('/commandes/{commande}/paiement', [CommandeController::class, 'paiement']);

    // Gestion réservée au Gérant
    Route::middleware('role:gerant')->group(function () {
        Route::post('/menus', [MenuController::class, 'store']);
        Route::put('/menus/{menu}', [MenuController::class, 'update']);
        Route::patch('/menus/{menu}/disponibilite', [MenuController::class, 'disponibilite']);
        Route::delete('/menus/{menu}', [MenuController::class, 'destroy']);

        Route::post('/tables', [TableController::class, 'store']);
        Route::put('/tables/{table}', [TableController::class, 'update']);
        Route::delete('/tables/{table}', [TableController::class, 'destroy']);

        Route::get('/serveurs', [ServeurController::class, 'index']);
        Route::get('/serveurs/{serveur}', [ServeurController::class, 'show']);
        Route::put('/serveurs/{serveur}', [ServeurController::class, 'update']);
        Route::delete('/serveurs/{serveur}', [ServeurController::class, 'destroy']);

        Route::get('/dashboard', [DashboardController::class, 'index']);
    });
});
