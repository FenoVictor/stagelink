<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') return;
        DB::statement("ALTER TABLE internships MODIFY COLUMN salary DECIMAL(12, 2) NULL");
    }

    public function down(): void
    {
    }
};
