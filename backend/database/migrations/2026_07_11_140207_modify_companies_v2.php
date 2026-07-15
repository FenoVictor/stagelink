<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('website');
            $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete()->after('industry');
            $table->text('address')->nullable()->after('city_id');
            $table->integer('employees_count')->nullable()->after('address');
            $table->boolean('verified')->default(false)->after('employees_count');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign(['city_id']);
            $table->dropColumn(['phone', 'city_id', 'address', 'employees_count', 'verified']);
        });
    }
};
