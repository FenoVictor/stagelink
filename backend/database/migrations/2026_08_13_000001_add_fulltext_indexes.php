<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // FULLTEXT n'est supporté que par MySQL / MariaDB (InnoDB).
        // SQLite (tests) est volontairement ignoré.
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        Schema::table('internships', function (Blueprint $table) {
            $table->fullText(['title', 'description']);
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->fullText(['name', 'description']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->fullText(['name']);
        });
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        Schema::table('internships', function (Blueprint $table) {
            $table->dropIndex('internships_title_description_fulltext');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->dropIndex('companies_name_description_fulltext');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_name_fulltext');
        });
    }
};
