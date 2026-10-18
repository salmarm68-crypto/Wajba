<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Gestion des serveurs par le Gérant. */
class ServeurTest extends TestCase
{
    use RefreshDatabase;

    public function test_le_gerant_liste_modifie_et_supprime_un_serveur(): void
    {
        Sanctum::actingAs($this->creerGerant());
        $serveur = $this->creerServeur();

        $this->getJson('/api/serveurs')->assertOk()->assertJsonCount(2);

        $this->putJson("/api/serveurs/{$serveur->id}", ['nom' => 'Nouveau nom'])
            ->assertOk()->assertJsonPath('nom', 'Nouveau nom');

        $this->deleteJson("/api/serveurs/{$serveur->id}")->assertNoContent();
        $this->assertSoftDeleted('serveurs', ['id' => $serveur->id]);
    }

    public function test_le_gerant_ne_peut_pas_se_supprimer_lui_meme(): void
    {
        $gerant = $this->creerGerant();
        Sanctum::actingAs($gerant);

        $this->deleteJson("/api/serveurs/{$gerant->id}")->assertUnprocessable();
    }
}
