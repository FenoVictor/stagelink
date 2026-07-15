<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('photo')->nullable()->after('cv_path');
            $table->string('github')->nullable()->after('photo');
            $table->string('portfolio')->nullable()->after('github');
            $table->string('linkedin')->nullable()->after('portfolio');
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn(['photo', 'github', 'portfolio', 'linkedin']);
        });
    }
};
