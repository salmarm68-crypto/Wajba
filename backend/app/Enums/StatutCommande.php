<?php

namespace App\Enums;

enum StatutCommande: string
{
    case EnAttente = 'en_attente';
    case EnPreparation = 'en_preparation';
    case Prete = 'prete';
    case Servie = 'servie';
    case Payee = 'payee';
    case Annulee = 'annulee';

    /** Statut suivant dans le circuit cuisine (null si aucun). */
    public function suivant(): ?self
    {
        return match ($this) {
            self::EnAttente => self::EnPreparation,
            self::EnPreparation => self::Prete,
            self::Prete => self::Servie,
            default => null,
        };
    }

    /** Une commande est ouverte tant qu'elle n'est ni payée ni annulée. */
    public function estOuverte(): bool
    {
        return ! in_array($this, [self::Payee, self::Annulee], true);
    }

    /** Valeurs des statuts d'une commande ouverte (pour les requêtes). */
    public static function ouvertes(): array
    {
        return [
            self::EnAttente->value,
            self::EnPreparation->value,
            self::Prete->value,
            self::Servie->value,
        ];
    }
}
