<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        try {
            Schema::table('interviews', function (Blueprint $table) {
                $table->dropForeign(['company_id']);
            });
        } catch (\Exception $e) {}

        Schema::table('interviews', function (Blueprint $table) {
            $table->dateTime('date');
            $table->string('meeting_link', 255)->nullable();
            $table->dropColumn(['company_id', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::table('interviews', function (Blueprint $table) {
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->timestamp('scheduled_at');
            $table->dropColumn(['date', 'meeting_link']);
        });
    }
};
