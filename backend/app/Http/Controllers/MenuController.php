<?php

namespace App\Http\Controllers;

use App\Enums\Categorie;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class MenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $requete = Menu::query()->orderBy('categorie')->orderBy('nom');

        if ($request->filled('categorie')) {
            $requete->where('categorie', $request->query('categorie'));
        }
        if ($request->filled('search')) {
            $requete->where('nom', 'like', '%'.$request->query('search').'%');
        }
        if ($request->has('disponible')) {
            $requete->where('disponible', $request->boolean('disponible'));
        }

        return response()->json($requete->get());
    }

    public function show(Menu $menu): JsonResponse
    {
        return response()->json($menu);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'prix' => ['required', 'numeric', 'min:0'],
            'categorie' => ['required', Rule::enum(Categorie::class)],
            'image' => ['nullable', 'string', 'max:255'],
            'disponible' => ['sometimes', 'boolean'],
        ]);

        return response()->json(Menu::create($data)->refresh(), 201);
    }

    public function update(Request $request, Menu $menu): JsonResponse
    {
        $data = $request->validate([
            'nom' => ['sometimes', 'required', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'prix' => ['sometimes', 'required', 'numeric', 'min:0'],
            'categorie' => ['sometimes', 'required', Rule::enum(Categorie::class)],
            'image' => ['nullable', 'string', 'max:255'],
            'disponible' => ['sometimes', 'boolean'],
        ]);

        $menu->update($data);

        return response()->json($menu->refresh());
    }

    /** Bascule la disponibilité d'un plat (disponible / indisponible). */
    public function disponibilite(Menu $menu): JsonResponse
    {
        $menu->update(['disponible' => ! $menu->disponible]);

        return response()->json($menu->refresh());
    }

    public function destroy(Menu $menu): Response
    {
        $menu->delete();

        return response()->noContent();
    }
}
