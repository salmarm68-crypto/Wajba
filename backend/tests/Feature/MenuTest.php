<?php

namespace Tests\Feature;

use App\Models\Menu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** CRUD du menu (Gérant). */
class MenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_cycle_complet_create_read_update_delete(): void
    {
        Sanctum::actingAs($this->creerGerant());

        $id = $this->postJson('/api/menus', [
            'nom' => 'Tajine de poulet', 'prix' => 90, 'categorie' => 'plat',
        ])->assertCreated()->json('id');

        $this->getJson('/api/menus')->assertOk()->assertJsonCount(1);

        $this->putJson("/api/menus/$id", ['prix' => 95])
            ->assertOk()->assertJsonPath('prix', '95.00');

        $this->patchJson("/api/menus/$id/disponibilite")
            ->assertOk()->assertJsonPath('disponible', false);

        $this->deleteJson("/api/menus/$id")->assertNoContent();
        $this->assertSoftDeleted('menus', ['id' => $id]);
    }

    public function test_la_categorie_doit_etre_valide(): void
    {
        Sanctum::actingAs($this->creerGerant());

        $this->postJson('/api/menus', ['nom' => 'X', 'prix' => 10, 'categorie' => 'inconnue'])
            ->assertUnprocessable()->assertJsonValidationErrors('categorie');
    }

    public function test_recherche_et_filtre_par_categorie(): void
    {
        Sanctum::actingAs($this->creerServeur());
        Menu::create(['nom' => 'Harira', 'prix' => 30, 'categorie' => 'entree']);
        Menu::create(['nom' => 'Couscous', 'prix' => 140, 'categorie' => 'plat']);

        $this->getJson('/api/menus?categorie=plat')->assertOk()->assertJsonCount(1);
        $this->getJson('/api/menus?search=Har')->assertOk()->assertJsonCount(1);
    }
}
