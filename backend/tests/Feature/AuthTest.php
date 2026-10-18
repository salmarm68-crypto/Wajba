<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Authentification : inscription, connexion, déconnexion, accès protégé. */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_inscription_cree_un_compte_serveur(): void
    {
        $reponse = $this->postJson('/api/register', [
            'nom' => 'Salma', 'email' => 'salma@test.ma', 'mot_de_passe' => 'password123',
        ]);

        $reponse->assertCreated()
            ->assertJsonPath('serveur.role', 'serveur')
            ->assertJsonStructure(['token', 'serveur' => ['id', 'nom', 'email']]);

        $this->assertDatabaseHas('serveurs', ['email' => 'salma@test.ma', 'role' => 'serveur']);
    }

    public function test_inscription_refuse_un_email_deja_utilise(): void
    {
        $this->creerServeur('doublon@test.ma');

        $this->postJson('/api/register', [
            'nom' => 'Autre', 'email' => 'doublon@test.ma', 'mot_de_passe' => 'password123',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_connexion_valide_renvoie_un_jeton(): void
    {
        $this->creerServeur('serveur@test.ma');

        $this->postJson('/api/login', ['email' => 'serveur@test.ma', 'mot_de_passe' => 'password123'])
            ->assertOk()
            ->assertJsonStructure(['token', 'serveur' => ['id', 'nom', 'role']]);
    }

    public function test_connexion_invalide_renvoie_422(): void
    {
        $this->creerServeur('serveur@test.ma');

        $this->postJson('/api/login', ['email' => 'serveur@test.ma', 'mot_de_passe' => 'mauvais-mot-de-passe'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_acces_sans_jeton_renvoie_401(): void
    {
        $this->getJson('/api/menus')->assertUnauthorized();
    }

    public function test_me_renvoie_l_utilisateur_connecte(): void
    {
        $serveur = $this->creerServeur();
        $jeton = $serveur->createToken('test')->plainTextToken;

        $this->withToken($jeton)->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('email', 'serveur@test.ma');
    }

    public function test_deconnexion_supprime_le_jeton(): void
    {
        $serveur = $this->creerServeur();
        $jeton = $serveur->createToken('test')->plainTextToken;

        $this->withToken($jeton)->postJson('/api/logout')->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
