<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Contrôle du rôle : réponse 403 si l'utilisateur n'a pas le rôle demandé.
 * Utilisation : ->middleware('role:gerant')
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user || $user->role->value !== $role) {
            return response()->json(['message' => 'Accès refusé : droits insuffisants.'], 403);
        }

        return $next($request);
    }
}
