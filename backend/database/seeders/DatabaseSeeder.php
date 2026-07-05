<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Category;
use App\Models\Company;
use App\Models\Internship;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Admin user
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@stagelink.fr',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Company user
        $companyUser = User::create([
            'name' => 'TechCorp',
            'email' => 'company@stagelink.fr',
            'password' => Hash::make('password'),
            'role' => 'company',
        ]);

        $company = Company::create([
            'user_id' => $companyUser->id,
            'name' => 'TechCorp',
            'description' => 'Leading technology company specializing in web and mobile development.',
            'website' => 'https://techcorp.example.com',
            'location' => 'Paris, France',
            'industry' => 'Technologies',
            'verified_at' => now(),
        ]);

        // Student user
        $studentUser = User::create([
            'name' => 'Étudiant Test',
            'email' => 'student@stagelink.fr',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        StudentProfile::create([
            'user_id' => $studentUser->id,
            'phone' => '+33123456789',
            'bio' => 'Étudiant en informatique passionné par le développement web.',
            'skills' => 'PHP, Laravel, JavaScript, React, SQL',
            'school' => 'Université de Paris',
            'major' => 'Informatique',
            'graduation_year' => 2025,
        ]);

        // Categories
        $categories = [
            ['name' => 'Développement', 'slug' => 'developpement'],
            ['name' => 'Marketing', 'slug' => 'marketing'],
            ['name' => 'Design', 'slug' => 'design'],
            ['name' => 'Finance', 'slug' => 'finance'],
            ['name' => 'Ressources Humaines', 'slug' => 'ressources-humaines'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        // Internships
        $devCategory = Category::where('slug', 'developpement')->first();
        $designCategory = Category::where('slug', 'design')->first();
        $marketingCategory = Category::where('slug', 'marketing')->first();

        $internship1 = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Développeur Laravel',
            'description' => 'Nous recherchons un stagiaire passionné pour rejoindre notre équipe de développement backend. Vous travaillerez sur des projets réels utilisant Laravel et PHP.',
            'requirements' => 'Connaissances en PHP, Laravel, MySQL. Esprit d\'équipe et autonomie.',
            'location' => 'Paris',
            'type' => 'hybrid',
            'duration' => '6 mois',
            'salary' => 1000.00,
            'slots' => 2,
            'deadline' => '2025-12-31',
            'status' => 'open',
        ]);

        $internship2 = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Designer UI/UX',
            'description' => 'Rejoignez notre équipe design pour créer des interfaces utilisateur modernes et intuitives.',
            'requirements' => 'Maîtrise de Figma, connaissance des principes d\'accessibilité.',
            'location' => 'Paris',
            'type' => 'remote',
            'duration' => '4 mois',
            'salary' => 900.00,
            'slots' => 1,
            'deadline' => '2025-11-30',
            'status' => 'open',
        ]);

        $internship3 = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Marketing Digital',
            'description' => 'Aidez-nous à développer notre présence en ligne et à acquérir de nouveaux clients.',
            'requirements' => 'Connaissances en SEO, SEA, et réseaux sociaux.',
            'location' => 'Paris',
            'type' => 'onsite',
            'duration' => '6 mois',
            'salary' => 800.00,
            'slots' => 1,
            'deadline' => '2025-10-15',
            'status' => 'open',
        ]);

        $internship1->categories()->attach($devCategory->id);
        $internship2->categories()->attach($designCategory->id);
        $internship3->categories()->attach($marketingCategory->id);

        // Application
        Application::create([
            'internship_id' => $internship1->id,
            'student_id' => $studentUser->id,
            'cover_letter' => 'Je suis très intéressé par ce stage car je souhaite approfondir mes compétences en Laravel.',
            'status' => 'pending',
        ]);
    }
}
