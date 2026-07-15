<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Category;
use App\Models\Commune;
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
        $this->call(LocationSeeder::class);
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
            'name' => 'TechCorp Madagascar',
            'description' => 'Entreprise technologique basée à Toliara, spécialisée dans le développement web et mobile.',
            'website' => 'https://techcorp.mg',
            'location' => 'Toliara, Madagascar',
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

        $toliara = Commune::where('name', 'Toliara')->first();

        StudentProfile::create([
            'user_id' => $studentUser->id,
            'phone' => '+261341234567',
            'bio' => 'Étudiant en informatique passionné par le développement web, basé à Toliara.',
            'school' => 'Université de Toliara',
            'major' => 'Informatique',
            'graduation_year' => 2025,
            'commune_id' => $toliara?->id,
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

        $studyLevels = ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Master', 'Doctorat'];
        $durations = ['2 mois', '3 mois', '4 mois', '6 mois'];
        $types = ['remote', 'onsite', 'hybrid'];
        $locations = ['Toliara', 'Antananarivo', 'Fianarantsoa', 'Antsiranana', 'Mahajanga', 'Toamasina'];

        $internship1 = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Développeur Laravel',
            'description' => 'Nous recherchons un stagiaire passionné pour rejoindre notre équipe de développement backend. Vous travaillerez sur des projets réels utilisant Laravel et PHP.',
            'requirements' => 'Connaissances en PHP, Laravel, MySQL. Esprit d\'équipe et autonomie.',
            'location' => 'Toliara',
            'type' => 'hybrid',
            'duration' => '6 mois',
            'study_level' => 'Bac+3',
            'salary' => 800000.00,
            'slots' => 2,
            'deadline' => '2025-12-31',
            'status' => 'published',
        ]);

        $internship2 = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Designer UI/UX',
            'description' => 'Rejoignez notre équipe design pour créer des interfaces utilisateur modernes et intuitives.',
            'requirements' => 'Maîtrise de Figma, connaissance des principes d\'accessibilité.',
            'location' => 'Antananarivo',
            'type' => 'remote',
            'duration' => '4 mois',
            'study_level' => 'Bac+2',
            'salary' => 600000.00,
            'slots' => 1,
            'deadline' => '2025-11-30',
            'status' => 'published',
        ]);

        $internship3 = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Marketing Digital',
            'description' => 'Aidez-nous à développer notre présence en ligne et à acquérir de nouveaux clients.',
            'requirements' => 'Connaissances en SEO, SEA, et réseaux sociaux.',
            'location' => 'Toliara',
            'type' => 'onsite',
            'duration' => '6 mois',
            'study_level' => 'Bac+3',
            'salary' => 500000.00,
            'slots' => 1,
            'deadline' => '2025-10-15',
            'status' => 'published',
        ]);

        for ($i = 1; $i <= 8; $i++) {
            Internship::create([
                'company_id' => $company->id,
                'title' => fake()->randomElement([
                    'Stagiaire Data Analyst',
                    'Stagiaire Community Manager',
                    'Assistant RH',
                    'Stagiaire Comptabilité',
                    'Développeur Web Full Stack',
                    'Stagiaire IoT',
                    'Assistant Chef de Projet',
                    'Stagiaire Cybersécurité',
                ]),
                'description' => fake()->paragraph(3),
                'requirements' => fake()->sentence(8),
                'location' => fake()->randomElement($locations),
                'type' => fake()->randomElement($types),
                'duration' => fake()->randomElement($durations),
                'study_level' => fake()->randomElement($studyLevels),
                'salary' => fake()->randomElement([0, 200000, 300000, 400000, 500000, 600000, 800000]),
                'slots' => fake()->numberBetween(1, 3),
                'deadline' => fake()->dateTimeBetween('+1 month', '+6 months')->format('Y-m-d'),
                'status' => 'published',
            ]);
        }

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
