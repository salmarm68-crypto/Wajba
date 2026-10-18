<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Enums\StatutCommande;
use App\Models\Commande;
use App\Models\Serveur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/** Gestion des serveurs (réservée au Gérant). La création passe par l'inscription. */
class ServeurController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Serveur::orderBy('nom')->get());
    }

    public function show(Serveur $serveur): JsonResponse
    {
        return response()->json($serveur);
    }

    public function update(Request $request, Serveur $serveur): JsonResponse
    {
        $data = $request->validate([
            'nom' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => ['sometimes', 'required', 'email', 'max:150', Rule::unique('serveurs', 'email')->ignore($serveur->id)],
            'role' => ['sometimes', 'required', Rule::enum(Role::class)],
            'mot_de_passe' => ['sometimes', 'required', 'string', 'min:8'],
        ]);

        if ($serveur->id === $request->user()->id && isset($data['role']) && $data['role'] !== Role::Gerant->value) {
            throw ValidationException::withMessages([
                'role' => ['Vous ne pouvez pas retirer votre propre rôle de Gérant.'],
            ]);
        }

        $serveur->update($data);

        return response()->json($serveur->refresh());
    }

    public function destroy(Request $request, Serveur $serveur): Response
    {
        if ($serveur->id === $request->user()->id) {
            throw ValidationException::withMessages([
                'serveur' => ['Vous ne pouvez pas supprimer votre propre compte.'],
            ]);
        }

        $aDesCommandesOuvertes = Commande::where('serveur_id', $serveur->id)
            ->whereIn('statut', StatutCommande::ouvertes())
            ->exists();

        if ($aDesCommandesOuvertes) {
            throw ValidationException::withMessages([
                'serveur' => ['Ce serveur a encore des commandes ouvertes.'],
            ]);
        }

        $serveur->tokens()->delete();
        $serveur->delete();

        return response()->noContent();
    }
}
