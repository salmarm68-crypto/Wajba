<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Serveur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** Inscription : crée toujours un compte Serveur. */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:serveurs,email'],
            'mot_de_passe' => ['required', 'string', 'min:8'],
        ]);

        $serveur = Serveur::create([
            'nom' => $data['nom'],
            'email' => $data['email'],
            'mot_de_passe' => $data['mot_de_passe'],
            'role' => Role::Serveur,
        ]);

        return response()->json([
            'token' => $serveur->createToken('wajba')->plainTextToken,
            'serveur' => $serveur,
        ], 201);
    }

    /** Connexion : vérifie les identifiants puis renvoie un jeton Sanctum. */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'mot_de_passe' => ['required', 'string'],
        ]);

        $serveur = Serveur::where('email', $data['email'])->first();

        if (! $serveur || ! Hash::check($data['mot_de_passe'], $serveur->mot_de_passe)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        return response()->json([
            'token' => $serveur->createToken('wajba')->plainTextToken,
            'serveur' => $serveur,
        ]);
    }

    /** Déconnexion : supprime le jeton utilisé pour la requête. */
    public function logout(Request $request): JsonResponse
    {
        $jeton = $request->user()->currentAccessToken();

        if (method_exists($jeton, 'delete')) {
            $jeton->delete();
        }

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
