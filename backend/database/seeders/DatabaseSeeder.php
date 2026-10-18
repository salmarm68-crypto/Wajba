<?php

namespace Database\Seeders;

use App\Enums\Categorie;
use App\Enums\ModePaiement;
use App\Enums\Role;
use App\Enums\StatutCommande;
use App\Enums\StatutTable;
use App\Models\Commande;
use App\Models\Menu;
use App\Models\Serveur;
use App\Models\Table;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration.
 * Comptes : gerant@wajba.ma et serveur@wajba.ma (mot de passe : password123).
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $gerant = Serveur::create([
            'nom' => 'Karim Benali', 'email' => 'gerant@wajba.ma',
            'mot_de_passe' => 'password123', 'role' => Role::Gerant,
        ]);
        $yassine = Serveur::create([
            'nom' => 'Yassine Amrani', 'email' => 'serveur@wajba.ma',
            'mot_de_passe' => 'password123', 'role' => Role::Serveur,
        ]);
        $imane = Serveur::create([
            'nom' => 'Imane Haddad', 'email' => 'imane@wajba.ma',
            'mot_de_passe' => 'password123', 'role' => Role::Serveur,
        ]);

        $capacites = [1 => 2, 2 => 4, 3 => 2, 4 => 6, 5 => 4, 6 => 8, 7 => 4, 8 => 2, 9 => 6, 10 => 4];
        $tables = [];
        foreach ($capacites as $numero => $capacite) {
            $tables[$numero] = Table::create(['numero' => $numero, 'capacite' => $capacite]);
        }

        $carte = [
            ['Salade marocaine', 'Tomates, concombre, oignon, persil, huile d\'olive.', 35, Categorie::Entree],
            ['Zaalouk', 'Aubergines fumées à la tomate, ail et cumin.', 40, Categorie::Entree],
            ['Pastilla au poulet', 'Feuilleté croustillant au poulet, amandes et cannelle.', 85, Categorie::Entree],
            ['Harira', 'Soupe traditionnelle aux lentilles, pois chiches et coriandre.', 30, Categorie::Entree],
            ['Briouates au fromage', 'Triangles croustillants au fromage frais et menthe.', 50, Categorie::Entree],
            ['Tajine d\'agneau aux pruneaux', 'Épaule d\'agneau confite, amandes grillées, miel.', 120, Categorie::Plat],
            ['Couscous royal', 'Semoule fine, sept légumes, agneau, poulet, merguez.', 140, Categorie::Plat],
            ['Tanjia marrakchia', 'Bœuf mijoté lentement au cumin et citron confit.', 130, Categorie::Plat],
            ['Poulet aux olives et citron confit', 'Sauce safranée, olives violettes.', 95, Categorie::Plat],
            ['Poisson chermoula', 'Poisson du jour mariné à la chermoula, légumes rôtis.', 150, Categorie::Plat],
            ['Méchoui d\'agneau', 'Agneau rôti lentement, servi avec du cumin.', 210, Categorie::Plat, false],
            ['Pastilla au lait', 'Feuilles croustillantes, crème légère et amandes.', 45, Categorie::Dessert],
            ['Cornes de gazelle', 'Pâtisserie aux amandes et eau de fleur d\'oranger.', 40, Categorie::Dessert],
            ['Salade d\'oranges à la cannelle', 'Oranges fraîches, cannelle et fleur d\'oranger.', 35, Categorie::Dessert],
            ['Thé à la menthe', 'Thé vert à la menthe fraîche.', 25, Categorie::Boisson],
            ['Jus d\'orange pressé', 'Oranges pressées minute.', 30, Categorie::Boisson],
            ['Eau minérale', 'Bouteille de 50 cl.', 15, Categorie::Boisson],
            ['Café noir', 'Café servi à la marocaine.', 20, Categorie::Boisson],
        ];

        $menus = [];
        foreach ($carte as $plat) {
            $menus[$plat[0]] = Menu::create([
                'nom' => $plat[0], 'description' => $plat[1], 'prix' => $plat[2],
                'categorie' => $plat[3], 'disponible' => $plat[4] ?? true,
            ]);
        }

        // Quelques commandes payées aujourd'hui (pour le tableau de bord)
        $this->commande($tables[2], $yassine, [['Tajine d\'agneau aux pruneaux', 2], ['Thé à la menthe', 2]], $menus, StatutCommande::Payee, ModePaiement::Especes);
        $this->commande($tables[4], $imane, [['Couscous royal', 3], ['Harira', 3], ['Eau minérale', 3]], $menus, StatutCommande::Payee, ModePaiement::Carte);
        $this->commande($tables[5], $yassine, [['Pastilla au poulet', 1], ['Poisson chermoula', 2], ['Jus d\'orange pressé', 2]], $menus, StatutCommande::Payee, ModePaiement::Carte);

        // Deux commandes en cours (plan de salle et écran cuisine)
        $this->commande($tables[7], $yassine, [['Tanjia marrakchia', 2], ['Salade marocaine', 2]], $menus, StatutCommande::EnPreparation);
        $this->commande($tables[9], $imane, [['Poulet aux olives et citron confit', 1], ['Café noir', 1]], $menus, StatutCommande::EnAttente);
    }

    private function commande(Table $table, Serveur $serveur, array $lignes, array $menus, StatutCommande $statut, ?ModePaiement $mode = null): void
    {
        $commande = Commande::create([
            'table_id' => $table->id, 'serveur_id' => $serveur->id, 'statut' => StatutCommande::EnAttente,
        ]);

        foreach ($lignes as [$nom, $quantite]) {
            $commande->menus()->attach($menus[$nom]->id, [
                'quantite' => $quantite, 'prix_unitaire' => $menus[$nom]->prix,
            ]);
        }

        $commande->calculerAddition();

        if ($statut === StatutCommande::Payee) {
            $commande->update(['statut' => $statut, 'mode_paiement' => $mode, 'paye_le' => now()]);
        } else {
            $commande->update(['statut' => $statut]);
            $table->update(['statut' => StatutTable::Occupee]);
        }
    }
}
