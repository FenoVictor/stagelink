<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MEDIUM: applications.status + composite
        Schema::table('applications', function (Blueprint $table) {
            $table->index('status');
            $table->index(['student_id', 'created_at']);
        });

        // MEDIUM: activity_logs composite
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index(['user_id', 'created_at']);
        });

        // LOW: neighborhoods.verified
        Schema::table('neighborhoods', function (Blueprint $table) {
            $table->index('verified');
        });

        // LOW: conversations composite
        Schema::table('conversations', function (Blueprint $table) {
            $table->index(['student_id', 'company_id']);
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['student_id', 'created_at']);
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
        });

        Schema::table('neighborhoods', function (Blueprint $table) {
            $table->dropIndex(['verified']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['student_id', 'company_id']);
        });
    }
};
