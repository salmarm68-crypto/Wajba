<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Table d'association de la classe LigneCommande. */
    public function up(): void
    {
        Schema::create('commande_menu', function (Blueprint $table) {
            $table->foreignId('commande_id')->constrained('commandes')->cascadeOnDelete();
            $table->foreignId('menu_id')->constrained('menus')->restrictOnDelete();
            $table->unsignedInteger('quantite')->default(1);
            $table->decimal('prix_unitaire', 8, 2);
            $table->string('note', 255)->nullable();
            $table->primary(['commande_id', 'menu_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commande_menu');
    }
};
