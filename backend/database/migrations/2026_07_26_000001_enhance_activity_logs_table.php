<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->string('subject_type', 100)->nullable()->after('action');
            $table->unsignedBigInteger('subject_id')->nullable()->after('subject_type');
            $table->json('metadata')->nullable()->after('subject_id');
            $table->string('browser', 100)->nullable()->after('user_agent');
            $table->string('result', 20)->default('success')->after('browser');
            $table->text('description')->nullable()->after('result');

            $table->index(['subject_type', 'subject_id']);
            $table->index('result');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['subject_type', 'subject_id']);
            $table->dropIndex('result');
            $table->dropIndex('created_at');
            $table->dropColumn([
                'subject_type', 'subject_id', 'metadata',
                'browser', 'result', 'description',
            ]);
        });
    }
};
