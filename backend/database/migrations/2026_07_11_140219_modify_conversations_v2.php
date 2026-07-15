<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        try {
            Schema::table('conversations', function (Blueprint $table) {
                $table->dropForeign(['internship_id']);
            });
        } catch (\Exception $e) {}

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropColumn(['internship_id', 'subject', 'last_message_at']);
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('internship_id')->nullable()->constrained('internships')->nullOnDelete();
            $table->string('subject', 255)->nullable();
            $table->timestamp('last_message_at')->nullable();
        });
    }
};
