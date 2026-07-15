<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $tables = [
        'users', 'companies', 'student_profiles', 'categories', 'internships',
        'applications', 'internship_category', 'favorites', 'notifications',
        'conversations', 'messages', 'interviews', 'conversation_participants',
        'personal_access_tokens',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            DB::statement("ALTER TABLE `{$table}` ENGINE = InnoDB");
        }
    }

    public function down(): void
    {
    }
};
