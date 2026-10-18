<?php

namespace App\Http\Controllers;

use App\Enums\StatutCommande;
use App\Enums\StatutTable;
use App\Models\Commande;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $payeesDuJour = Commande::where('statut', StatutCommande::Payee->value)
            ->where('paye_le', '>=', now()->startOfDay());

        $platsPopulaires = DB::table('commande_menu')
            ->join('commandes', 'commandes.id', '=', 'commande_menu.commande_id')
            ->join('menus', 'menus.id', '=', 'commande_menu.menu_id')
            ->where('commandes.statut', '!=', StatutCommande::Annulee->value)
            ->selectRaw('menus.id as menu_id, menus.nom as nom, SUM(commande_menu.quantite) as quantite')
            ->groupBy('menus.id', 'menus.nom')
            ->orderByDesc('quantite')
            ->limit(5)
            ->get();

        return response()->json([
            'chiffre_affaires_du_jour' => (float) (clone $payeesDuJour)->sum('total'),
            'commandes_payees_du_jour' => (clone $payeesDuJour)->count(),
            'commandes_en_cours' => Commande::whereIn('statut', StatutCommande::ouvertes())->count(),
            'tables_occupees' => Table::where('statut', '!=', StatutTable::Libre->value)->count(),
            'tables_total' => Table::count(),
            'plats_populaires' => $platsPopulaires,
        ]);
    }
}
