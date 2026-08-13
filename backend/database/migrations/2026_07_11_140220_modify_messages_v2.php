<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $hasData = DB::table('messages')->exists();

        if ($hasData && app()->environment('production')) {
            throw new \RuntimeException(
                'Refus de tronquer la table messages en production : cette migration est destructrice. ' .
                'Vérifiez l\'état de la base avant de poursuivre (php artisan migrate --force après audit).'
            );
        }

        DB::table('messages')->truncate();

        try {
            Schema::table('messages', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        } catch (\Exception $e) {}

        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->dropColumn(['user_id', 'body', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->timestamp('read_at')->nullable();

            $table->dropForeign(['sender_id']);
            $table->dropColumn(['sender_id', 'message', 'is_read']);
        });
    }
};
