<?php

namespace Tests;

use App\Enums\Role;
use App\Models\Serveur;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function creerServeur(string $email = 'serveur@test.ma'): Serveur
    {
        return Serveur::create([
            'nom' => 'Serveur Test', 'email' => $email,
            'mot_de_passe' => 'password123', 'role' => Role::Serveur,
        ]);
    }

    protected function creerGerant(string $email = 'gerant@test.ma'): Serveur
    {
        return Serveur::create([
            'nom' => 'Gérant Test', 'email' => $email,
            'mot_de_passe' => 'password123', 'role' => Role::Gerant,
        ]);
    }
}
