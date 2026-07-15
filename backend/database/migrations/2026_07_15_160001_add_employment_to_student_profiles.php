<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->boolean('is_employed')->default(false)->after('neighborhood_id');
            $table->string('job_title')->nullable()->after('is_employed');
            $table->string('employer')->nullable()->after('job_title');
            $table->date('employed_at')->nullable()->after('employer');
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn(['is_employed', 'job_title', 'employer', 'employed_at']);
        });
    }
};
