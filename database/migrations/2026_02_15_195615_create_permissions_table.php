<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete()
                ->unique();
            $table->boolean('can_manage_system')->default(false);
            $table->boolean('can_moderate')->default(false);
            $table->boolean('can_post')->default(true);
            $table->boolean('can_comment')->default(true);
            $table->boolean('can_update_username')->default(true);
            $table->boolean('can_update_avatar')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
