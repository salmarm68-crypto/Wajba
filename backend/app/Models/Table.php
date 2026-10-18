<?php

namespace App\Models;

use App\Enums\StatutTable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Table extends Model
{
    use SoftDeletes;

    protected $table = 'tables';

    protected $fillable = ['numero', 'capacite', 'statut'];

    protected function casts(): array
    {
        return [
            'statut' => StatutTable::class,
        ];
    }

    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class);
    }
}
