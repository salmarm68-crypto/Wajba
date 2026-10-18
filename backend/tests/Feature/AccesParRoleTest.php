<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Contrôle d'accès : le Serveur reçoit 403 sur les routes réservées au Gérant. */
class AccesParRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_serveur_ne_peut_pas_creer_un_plat(): void
    {
        Sanctum::actingAs($this->creerServeur());

        $this->postJson('/api/menus', [
            'nom' => 'Test', 'prix' => 10, 'categorie' => 'plat',
        ])->assertForbidden();
    }

    public function test_un_serveur_ne_peut_pas_gerer_les_serveurs_ni_le_tableau_de_bord(): void
    {
        Sanctum::actingAs($this->creerServeur());

        $this->getJson('/api/serveurs')->assertForbidden();
        $this->getJson('/api/dashboard')->assertForbidden();
        $this->postJson('/api/tables', ['numero' => 1, 'capacite' => 2])->assertForbidden();
    }

    public function test_un_gerant_a_acces_aux_routes_reservees(): void
    {
        Sanctum::actingAs($this->creerGerant());

        $this->getJson('/api/serveurs')->assertOk();
        $this->getJson('/api/dashboard')->assertOk();
    }

    public function test_un_serveur_peut_consulter_le_menu_et_le_plan_de_salle(): void
    {
        Sanctum::actingAs($this->creerServeur());

        $this->getJson('/api/menus')->assertOk();
        $this->getJson('/api/tables')->assertOk();
    }
}
