<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\Serveur;
use App\Models\Table;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Commandes : création, règles de gestion, cuisine, addition, remise, paiement. */
class CommandeTest extends TestCase
{
    use RefreshDatabase;

    private Serveur $serveur;
    private Table $table;
    private Menu $tajine;
    private Menu $the;

    protected function setUp(): void
    {
        parent::setUp();

        $this->serveur = $this->creerServeur();
        Sanctum::actingAs($this->serveur);

        $this->table = Table::create(['numero' => 7, 'capacite' => 4]);
        $this->tajine = Menu::create(['nom' => 'Tajine', 'prix' => 120, 'categorie' => 'plat']);
        $this->the = Menu::create(['nom' => 'Thé à la menthe', 'prix' => 25, 'categorie' => 'boisson']);
    }

    private function lignes(): array
    {
        return [
            ['menu_id' => $this->tajine->id, 'quantite' => 2, 'note' => 'sans amandes'],
            ['menu_id' => $this->the->id, 'quantite' => 2],
        ];
    }

    private function creerCommande(): int
    {
        return $this->postJson('/api/commandes', [
            'table_id' => $this->table->id, 'lignes' => $this->lignes(),
        ])->assertCreated()->json('data.id');
    }

    public function test_la_creation_occupe_la_table_et_calcule_l_addition(): void
    {
        $reponse = $this->postJson('/api/commandes', [
            'table_id' => $this->table->id, 'lignes' => $this->lignes(),
        ]);

        $reponse->assertCreated()->assertJsonPath('data.statut', 'en_attente');
        // 2 x 120 + 2 x 25 = 290 ; TVA 10 % = 29 ; total = 319
        $this->assertEqualsWithDelta(290.0, $reponse->json('data.sous_total'), 0.001);
        $this->assertEqualsWithDelta(29.0, $reponse->json('data.tva'), 0.001);
        $this->assertEqualsWithDelta(319.0, $reponse->json('data.total'), 0.001);

        $this->assertDatabaseHas('tables', ['id' => $this->table->id, 'statut' => 'occupee']);
    }

    public function test_un_plat_indisponible_est_refuse(): void
    {
        $this->tajine->update(['disponible' => false]);

        $this->postJson('/api/commandes', [
            'table_id' => $this->table->id, 'lignes' => $this->lignes(),
        ])->assertUnprocessable()->assertJsonValidationErrors('lignes.0.menu_id');
    }

    public function test_une_table_occupee_est_refusee(): void
    {
        $this->creerCommande();

        $this->postJson('/api/commandes', [
            'table_id' => $this->table->id, 'lignes' => $this->lignes(),
        ])->assertUnprocessable()->assertJsonValidationErrors('table_id');
    }

    public function test_le_prix_unitaire_reste_fige(): void
    {
        $id = $this->creerCommande();
        $this->tajine->update(['prix' => 200]);

        $reponse = $this->getJson("/api/commandes/$id")->assertOk();
        $this->assertEqualsWithDelta(319.0, $reponse->json('data.total'), 0.001);
    }

    public function test_les_statuts_suivent_l_ordre(): void
    {
        $id = $this->creerCommande();

        // Saut d'étape interdit
        $this->patchJson("/api/commandes/$id/statut", ['statut' => 'servie'])->assertUnprocessable();

        $this->patchJson("/api/commandes/$id/statut")->assertOk()->assertJsonPath('data.statut', 'en_preparation');
        $this->patchJson("/api/commandes/$id/statut")->assertOk()->assertJsonPath('data.statut', 'prete');
        $this->patchJson("/api/commandes/$id/statut", ['statut' => 'servie'])->assertOk()->assertJsonPath('data.statut', 'servie');

        // Plus de statut suivant
        $this->patchJson("/api/commandes/$id/statut")->assertUnprocessable();
    }

    public function test_la_liste_en_cours_est_filtrable(): void
    {
        $this->creerCommande();

        $this->getJson('/api/commandes?statut=en_cours')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/commandes?statut=payee')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_la_modification_des_lignes_recalcule_le_total(): void
    {
        $id = $this->creerCommande();

        $reponse = $this->putJson("/api/commandes/$id", [
            'lignes' => [['menu_id' => $this->tajine->id, 'quantite' => 1]],
        ])->assertOk();

        // 120 + TVA 12 = 132
        $this->assertEqualsWithDelta(132.0, $reponse->json('data.total'), 0.001);
    }

    public function test_la_demande_d_addition_applique_la_remise_et_la_tva(): void
    {
        $id = $this->creerCommande();

        $this->postJson("/api/commandes/$id/addition")->assertOk();
        $this->assertDatabaseHas('tables', ['id' => $this->table->id, 'statut' => 'addition_demandee']);

        // Remise de 40 : (290 - 40) = 250 ; TVA 25 ; total 275
        $reponse = $this->patchJson("/api/commandes/$id/remise", ['remise' => 40])->assertOk();
        $this->assertEqualsWithDelta(25.0, $reponse->json('data.tva'), 0.001);
        $this->assertEqualsWithDelta(275.0, $reponse->json('data.total'), 0.001);
    }

    public function test_la_remise_ne_peut_pas_depasser_le_sous_total(): void
    {
        $id = $this->creerCommande();

        $this->patchJson("/api/commandes/$id/remise", ['remise' => 1000])
            ->assertUnprocessable()->assertJsonValidationErrors('remise');
    }

    public function test_le_paiement_cloture_la_commande_et_libere_la_table(): void
    {
        $id = $this->creerCommande();

        $this->postJson("/api/commandes/$id/paiement", ['mode_paiement' => 'carte'])
            ->assertOk()
            ->assertJsonPath('data.statut', 'payee')
            ->assertJsonPath('data.mode_paiement', 'carte');

        $this->assertDatabaseHas('tables', ['id' => $this->table->id, 'statut' => 'libre']);

        // Une commande payée ne peut plus être modifiée
        $this->putJson("/api/commandes/$id", [
            'lignes' => [['menu_id' => $this->the->id, 'quantite' => 1]],
        ])->assertUnprocessable();

        // La table peut recevoir une nouvelle commande
        $this->creerCommande();
    }

    public function test_le_mode_de_paiement_est_obligatoire(): void
    {
        $id = $this->creerCommande();

        $this->postJson("/api/commandes/$id/paiement", [])
            ->assertUnprocessable()->assertJsonValidationErrors('mode_paiement');
    }

    public function test_l_annulation_libere_la_table(): void
    {
        $id = $this->creerCommande();

        $this->deleteJson("/api/commandes/$id")->assertOk()->assertJsonPath('data.statut', 'annulee');
        $this->assertDatabaseHas('tables', ['id' => $this->table->id, 'statut' => 'libre']);
    }

    public function test_le_tableau_de_bord_compte_le_chiffre_d_affaires_du_jour(): void
    {
        $id = $this->creerCommande();
        $this->postJson("/api/commandes/$id/paiement", ['mode_paiement' => 'especes'])->assertOk();

        Sanctum::actingAs($this->creerGerant());

        $reponse = $this->getJson('/api/dashboard')->assertOk();
        $this->assertEqualsWithDelta(319.0, $reponse->json('chiffre_affaires_du_jour'), 0.001);
        $this->assertSame(1, $reponse->json('commandes_payees_du_jour'));
        $this->assertSame('Tajine', $reponse->json('plats_populaires.0.nom'));
    }
}
