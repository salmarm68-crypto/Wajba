<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('serveurs', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('email', 150)->unique();
            $table->string('mot_de_passe');
            $table->enum('role', ['serveur', 'gerant'])->default('serveur');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('serveurs');
    }
};
