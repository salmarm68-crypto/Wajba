<?php

namespace App\Models;

use App\Enums\Categorie;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use SoftDeletes;

    protected $table = 'menus';

    protected $fillable = ['nom', 'description', 'prix', 'categorie', 'image', 'disponible'];

    protected function casts(): array
    {
        return [
            'categorie' => Categorie::class,
            'prix' => 'decimal:2',
            'disponible' => 'boolean',
        ];
    }
}
