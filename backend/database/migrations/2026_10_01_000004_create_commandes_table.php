<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('table_id')->constrained('tables')->restrictOnDelete();
            $table->foreignId('serveur_id')->constrained('serveurs')->restrictOnDelete();
            $table->enum('statut', ['en_attente', 'en_preparation', 'prete', 'servie', 'payee', 'annulee'])
                ->default('en_attente');
            $table->decimal('remise', 8, 2)->default(0);
            $table->decimal('sous_total', 10, 2)->default(0);
            $table->decimal('tva', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->enum('mode_paiement', ['especes', 'carte'])->nullable();
            $table->dateTime('paye_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
