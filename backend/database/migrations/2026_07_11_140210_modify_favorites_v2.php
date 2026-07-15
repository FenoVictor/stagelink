<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('favorites')->truncate();

        try {
            Schema::table('favorites', function (Blueprint $table) {
                $table->dropUnique(['user_id', 'internship_id']);
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('favorites', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        } catch (\Exception $e) {}

        Schema::table('favorites', function (Blueprint $table) {
            $table->dropColumn('user_id');
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->unique(['student_id', 'internship_id']);
        });
    }

    public function down(): void
    {
        try {
            Schema::table('favorites', function (Blueprint $table) {
                $table->dropUnique(['student_id', 'internship_id']);
            });
        } catch (\Exception $e) {}

        Schema::table('favorites', function (Blueprint $table) {
            $table->dropColumn('student_id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unique(['user_id', 'internship_id']);
        });
    }
};
