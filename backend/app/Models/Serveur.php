<?php

namespace App\Models;

use App\Enums\Role;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Serveur extends Authenticatable
{
    use HasApiTokens, SoftDeletes;

    protected $table = 'serveurs';

    protected $fillable = ['nom', 'email', 'mot_de_passe', 'role'];

    protected $hidden = ['mot_de_passe'];

    protected function casts(): array
    {
        return [
            'role' => Role::class,
            'mot_de_passe' => 'hashed',
        ];
    }

    /** Laravel lit le mot de passe dans la colonne mot_de_passe. */
    public function getAuthPassword(): string
    {
        return $this->mot_de_passe;
    }

    public function estGerant(): bool
    {
        return $this->role === Role::Gerant;
    }

    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class);
    }
}
