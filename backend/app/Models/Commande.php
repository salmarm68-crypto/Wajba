<?php

namespace App\Models;

use App\Enums\ModePaiement;
use App\Enums\StatutCommande;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Commande extends Model
{
    /** Taux de TVA appliqué à l'addition (10 %). */
    public const TAUX_TVA = 0.10;

    protected $table = 'commandes';

    protected $fillable = [
        'table_id', 'serveur_id', 'statut', 'remise', 'sous_total',
        'tva', 'total', 'mode_paiement', 'paye_le',
    ];

    protected function casts(): array
    {
        return [
            'statut' => StatutCommande::class,
            'mode_paiement' => ModePaiement::class,
            'remise' => 'decimal:2',
            'sous_total' => 'decimal:2',
            'tva' => 'decimal:2',
            'total' => 'decimal:2',
            'paye_le' => 'datetime',
        ];
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    public function serveur(): BelongsTo
    {
        return $this->belongsTo(Serveur::class);
    }

    /** Lignes de commande : plats, quantité, prix unitaire figé et note. */
    public function menus(): BelongsToMany
    {
        return $this->belongsToMany(Menu::class, 'commande_menu')
            ->withPivot(['quantite', 'prix_unitaire', 'note']);
    }

    public function estOuverte(): bool
    {
        return $this->statut->estOuverte();
    }

    /**
     * Calcule l'addition : sous-total, remise, puis TVA de 10 % et total.
     * Total = (sous-total - remise) + TVA.
     */
    public function calculerAddition(): void
    {
        $sousTotal = 0.0;
        foreach ($this->menus()->get() as $menu) {
            $sousTotal += (int) $menu->pivot->quantite * (float) $menu->pivot->prix_unitaire;
        }
        $sousTotal = round($sousTotal, 2);

        $remise = min(max((float) $this->remise, 0.0), $sousTotal);
        $base = $sousTotal - $remise;
        $tva = round($base * self::TAUX_TVA, 2);

        $this->sous_total = $sousTotal;
        $this->remise = $remise;
        $this->tva = $tva;
        $this->total = round($base + $tva, 2);
        $this->save();
    }
}
