<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('title', 255)->nullable()->after('user_id');
            $table->text('message')->nullable()->after('title');
            $table->dropColumn('data');
            $table->dropColumn('read_at');
            $table->boolean('is_read')->default(false)->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['title', 'message', 'is_read']);
            $table->text('data')->nullable()->after('type');
            $table->timestamp('read_at')->nullable()->after('data');
        });
    }
};
