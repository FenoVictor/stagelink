<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 20);
            $table->text('message');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->string('name', 120)->nullable();
            $table->string('email', 190)->nullable();
            $table->string('status', 20)->default('new');
            $table->text('admin_note')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('type');
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
