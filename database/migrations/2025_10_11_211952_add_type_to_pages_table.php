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
        Schema::table('pages', function (Blueprint $table) {
            $table->enum('type', ['normal', 'policy', 'guidelines'])
                ->default('normal')
                ->after('language');
            $table->index(['language', 'type'], 'pages_language_type_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropIndex('pages_language_type_index');
            $table->dropColumn('type');
        });
    }
};
