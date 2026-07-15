<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('student_profiles', 'phone')) {
                $table->string('phone', 20)->nullable()->after('user_id');
            }
            $table->date('birth_date')->nullable()->after('phone');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('birth_date');
            $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete()->after('gender');
            $table->text('address')->nullable()->after('city_id');

            if (Schema::hasColumn('student_profiles', 'skills')) {
                $table->dropColumn('skills');
            }
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropForeign(['city_id']);
            $table->dropColumn(['phone', 'birth_date', 'gender', 'city_id', 'address']);
        });
    }
};
