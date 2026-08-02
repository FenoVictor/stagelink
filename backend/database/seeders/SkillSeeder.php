<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            // Informatique & Tech
            'PHP', 'Laravel', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#',
            'React', 'Vue.js', 'Angular', 'Node.js', 'HTML/CSS', 'SQL', 'MySQL', 'PostgreSQL',
            'MongoDB', 'Git', 'Docker', 'Linux', 'WordPress', 'Symfony', 'Django', 'Flutter',
            'Swift', 'Kotlin', 'React Native', 'REST API', 'GraphQL', 'AWS', 'Firebase',
            'Tailwind CSS', 'Bootstrap', 'jQuery', 'Sass/Less', 'Webpack', 'Vite',
            'Machine Learning', 'Data Science', 'Intelligence Artificielle', 'Power BI', 'Excel Avancé',
            'R', 'TensorFlow', 'Pandas', 'NumPy', 'Scikit-learn',

            // Design & Créatif
            'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe XD', 'Sketch',
            'UI/UX Design', 'Design Graphique', 'Motion Design', 'Photography',
            'Canva', 'After Effects', 'InDesign', 'Blender',

            // Marketing & Communication
            'SEO', 'SEA', 'Google Analytics', 'Google Ads', 'Facebook Ads',
            'Réseaux Sociaux', 'Community Management', 'Content Marketing',
            'Email Marketing', 'Copywriting', 'Communication', 'Référencement Naturel',
            'TikTok Marketing', 'Influence Marketing',

            // Business & Finance
            'Comptabilité', 'Finance', 'Gestion de Projet', 'Excel', 'SAP',
            'Business Plan', 'Marketing Digital', 'Vente', 'Négociation',
            'Stratégie', 'Analyse Financière', 'Bilingue',

            // Langues
            'Anglais', 'Français', 'Malgache', 'Espagnol', 'Chinois',
            'Allemand', 'Italien', 'Portugais', 'Arabe',

            // Soft Skills
            'Leadership', 'Travail d\'équipe', 'Communication', 'Créativité',
            'Résolution de problèmes', 'Gestion du temps', 'Adaptabilité',
            'Prise de parole', 'Esprit critique', 'Organisation',

            // Autres
            'Rédaction', 'Recherche', 'Analyse de données', 'Statistiques',
            'Tutorat', 'Mentorat', 'Bénévolat', 'Association',
        ];

        foreach ($skills as $name) {
            Skill::firstOrCreate(['name' => $name]);
        }
    }
}
