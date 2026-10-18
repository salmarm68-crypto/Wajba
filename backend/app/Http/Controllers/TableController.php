<?php

namespace App\Http\Controllers;

use App\Enums\StatutCommande;
use App\Enums\StatutTable;
use App\Models\Commande;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TableController extends Controller
{
    /** Plan de salle : chaque table avec sa commande ouverte éventuelle. */
    public function index(): JsonResponse
    {
        $ouvertes = Commande::with('serveur:id,nom')
            ->whereIn('statut', StatutCommande::ouvertes())
            ->get()
            ->keyBy('table_id');

        $tables = Table::orderBy('numero')->get()->map(function (Table $table) use ($ouvertes) {
            $commande = $ouvertes->get($table->id);

            return array_merge($table->toArray(), [
                'commande_ouverte' => $commande ? [
                    'id' => $commande->id,
                    'statut' => $commande->statut->value,
                    'total' => (float) $commande->total,
                    'serveur' => $commande->serveur?->nom,
                    'created_at' => $commande->created_at?->toIso8601String(),
                ] : null,
            ]);
        });

        return response()->json($tables);
    }

    public function show(Table $table): JsonResponse
    {
        return response()->json($table);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'numero' => ['required', 'integer', 'min:1', 'unique:tables,numero'],
            'capacite' => ['required', 'integer', 'min:1', 'max:50'],
        ]);

        $table = Table::create($data + ['statut' => StatutTable::Libre]);

        return response()->json($table->refresh(), 201);
    }

    public function update(Request $request, Table $table): JsonResponse
    {
        $data = $request->validate([
            'numero' => ['sometimes', 'required', 'integer', 'min:1', Rule::unique('tables', 'numero')->ignore($table->id)],
            'capacite' => ['sometimes', 'required', 'integer', 'min:1', 'max:50'],
        ]);

        $table->update($data);

        return response()->json($table->refresh());
    }

    public function destroy(Table $table): Response
    {
        $aUneCommandeOuverte = Commande::where('table_id', $table->id)
            ->whereIn('statut', StatutCommande::ouvertes())
            ->exists();

        if ($aUneCommandeOuverte) {
            throw ValidationException::withMessages([
                'table' => ['Impossible de supprimer une table qui a une commande ouverte.'],
            ]);
        }

        $table->delete();

        return response()->noContent();
    }
}
