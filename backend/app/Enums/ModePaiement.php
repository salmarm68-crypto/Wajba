<?php

namespace App\Enums;

enum ModePaiement: string
{
    case Especes = 'especes';
    case Carte = 'carte';
}
