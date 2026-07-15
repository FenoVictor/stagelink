<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('diploma')->nullable()->after('major');
            $table->string('current_level')->nullable()->after('diploma');
            $table->integer('study_start')->nullable()->after('current_level');
            $table->integer('study_end')->nullable()->after('study_start');
            $table->timestamp('cv_uploaded_at')->nullable()->after('cv_path');
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn(['diploma', 'current_level', 'study_start', 'study_end', 'cv_uploaded_at']);
        });
    }
};
