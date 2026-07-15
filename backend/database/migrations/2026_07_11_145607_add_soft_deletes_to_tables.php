<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'deleted_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (!Schema::hasColumn('companies', 'deleted_at')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (!Schema::hasColumn('internships', 'deleted_at')) {
            Schema::table('internships', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('companies', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('internships', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
