<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommandeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'statut' => $this->statut->value,
            'table' => $this->whenLoaded('table', fn () => [
                'id' => $this->table->id,
                'numero' => $this->table->numero,
                'statut' => $this->table->statut->value,
            ]),
            'serveur' => $this->whenLoaded('serveur', fn () => [
                'id' => $this->serveur->id,
                'nom' => $this->serveur->nom,
            ]),
            'lignes' => $this->whenLoaded('menus', fn () => $this->menus->map(fn ($menu) => [
                'menu_id' => $menu->id,
                'nom' => $menu->nom,
                'quantite' => (int) $menu->pivot->quantite,
                'prix_unitaire' => (float) $menu->pivot->prix_unitaire,
                'note' => $menu->pivot->note,
                'sous_total' => round((int) $menu->pivot->quantite * (float) $menu->pivot->prix_unitaire, 2),
            ])->values()),
            'remise' => (float) $this->remise,
            'sous_total' => (float) $this->sous_total,
            'tva' => (float) $this->tva,
            'total' => (float) $this->total,
            'mode_paiement' => $this->mode_paiement?->value,
            'paye_le' => $this->paye_le?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
