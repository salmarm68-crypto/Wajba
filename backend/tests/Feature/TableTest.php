<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\Table;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** CRUD des tables (Gérant) et plan de salle. */
class TableTest extends TestCase
{
    use RefreshDatabase;

    public function test_cycle_complet_create_read_update_delete(): void
    {
        Sanctum::actingAs($this->creerGerant());

        $id = $this->postJson('/api/tables', ['numero' => 12, 'capacite' => 4])
            ->assertCreated()->assertJsonPath('statut', 'libre')->json('id');

        $this->getJson('/api/tables')->assertOk()->assertJsonCount(1);
        $this->putJson("/api/tables/$id", ['capacite' => 6])->assertOk()->assertJsonPath('capacite', 6);
        $this->deleteJson("/api/tables/$id")->assertNoContent();
        $this->assertSoftDeleted('tables', ['id' => $id]);
    }

    public function test_le_numero_de_table_doit_etre_unique(): void
    {
        Sanctum::actingAs($this->creerGerant());
        Table::create(['numero' => 5, 'capacite' => 2]);

        $this->postJson('/api/tables', ['numero' => 5, 'capacite' => 4])
            ->assertUnprocessable()->assertJsonValidationErrors('numero');
    }

    public function test_une_table_avec_commande_ouverte_ne_peut_pas_etre_supprimee(): void
    {
        $gerant = $this->creerGerant();
        Sanctum::actingAs($gerant);
        $table = Table::create(['numero' => 1, 'capacite' => 2]);
        $menu = Menu::create(['nom' => 'Harira', 'prix' => 30, 'categorie' => 'entree']);

        $this->postJson('/api/commandes', [
            'table_id' => $table->id, 'lignes' => [['menu_id' => $menu->id, 'quantite' => 1]],
        ])->assertCreated();

        $this->deleteJson("/api/tables/{$table->id}")->assertUnprocessable();
    }
}
