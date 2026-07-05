<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->string('location')->nullable();
            $table->enum('type', ['remote', 'onsite', 'hybrid'])->default('onsite');
            $table->string('duration')->nullable();
            $table->decimal('salary', 8, 2)->nullable();
            $table->integer('slots')->default(1);
            $table->date('deadline')->nullable();
            $table->enum('status', ['draft', 'open', 'closed', 'filled'])->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internships');
    }
};
