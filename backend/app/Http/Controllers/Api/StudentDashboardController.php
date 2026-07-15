<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\Interview;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentDashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['studentProfile', 'skills', 'applications', 'activeInternships']);

        $profile = $user->studentProfile;

        // Completion
        $completion = $this->computeCompletion($profile, $user);

        // Missing steps
        $missingSteps = [];
        if (!$profile->photo && !$profile->photo_url) $missingSteps[] = 'photo';
        if (!$profile->cv_path) $missingSteps[] = 'cv';
        if ($user->skills->isEmpty()) $missingSteps[] = 'skills';
        if (!$profile->bio) $missingSteps[] = 'bio';
        if (!$profile->school) $missingSteps[] = 'school';

        $achievedSteps = [];
        if ($profile->photo || $profile->photo_url) $achievedSteps[] = 'photo';
        if ($profile->cv_path) $achievedSteps[] = 'cv';
        if (!$user->skills->isEmpty()) $achievedSteps[] = 'skills';
        if ($profile->bio) $achievedSteps[] = 'bio';
        if ($profile->school) $achievedSteps[] = 'school';

        // Stats
        $appCount = $user->applications->count();
        $favCount = $user->favorites()->count();
        $interviewCount = Interview::whereHas('application', fn($q) => $q->where('student_id', $user->id))
            ->where('date', '>', now())
            ->count();
        $activeInternshipCount = $user->activeInternships->where('status', 'in_progress')->count();
        $hasCompletedInternship = $user->activeInternships->where('status', 'completed')->isNotEmpty();

        // Recommended internships
        $skillNames = $user->skills->pluck('name')->map(fn($n) => mb_strtolower($n))->toArray();
        $major = $profile ? mb_strtolower($profile->major ?? '') : '';

        $internships = Internship::with('category')
            ->where('status', 'published')
            ->whereDoesntHave('applications', fn($q) => $q->where('student_id', $user->id))
            ->take(50)
            ->get();

        $scored = $internships->map(function ($internship) use ($skillNames, $major, $user) {
            $score = 30;
            $catName = $internship->category ? mb_strtolower($internship->category->name) : '';
            $title = mb_strtolower($internship->title);
            $haystack = $catName . ' ' . $title;
            $matchedSkills = [];

            foreach ($skillNames as $skill) {
                if (str_contains($haystack, $skill)) {
                    $score += 40;
                    $matchedSkills[] = $skill;
                    break;
                }
            }

            if ($major && (str_contains($title, $major) || str_contains($catName, $major))) {
                $score += 20;
            }

            // Suggest missing skills
            $missingSuggestions = [];
            $internshipText = mb_strtolower(($internship->description ?? '') . ' ' . ($internship->requirements ?? ''));
            $allSkills = \App\Models\Skill::pluck('name')->map(fn($n) => mb_strtolower($n))->toArray();
            foreach ($allSkills as $s) {
                if (!in_array($s, $skillNames) && str_contains($internshipText, $s)) {
                    $originalName = \App\Models\Skill::whereRaw('LOWER(name) = ?', [$s])->value('name');
                    $missingSuggestions[] = $originalName ?? $s;
                    if (count($missingSuggestions) >= 3) break;
                }
            }

            return [
                'id' => $internship->id,
                'title' => $internship->title,
                'company' => $internship->company ? $internship->company->name : null,
                'company_id' => $internship->company_id,
                'location' => $internship->location,
                'type' => $internship->type,
                'salary' => $internship->salary,
                'category' => $internship->category ? $internship->category->name : null,
                'match_score' => min(99, $score),
                'slug' => $internship->slug,
                'suggested_skills' => $missingSuggestions,
            ];
        });

        $recommendations = $scored->sortByDesc('match_score')->take(3)->values();

        // Badges
        $badges = [];
        $badges[] = ['key' => 'member', 'label' => 'Nouveau membre', 'icon' => 'trophy', 'earned' => true];

        if ($completion >= 80) {
            $badges[] = ['key' => 'profile_complete', 'label' => 'Profil complété', 'icon' => 'shield', 'earned' => true];
        } else {
            $badges[] = ['key' => 'profile_complete', 'label' => 'Profil complété', 'icon' => 'shield', 'earned' => false];
        }

        if ($profile && $profile->cv_path) {
            $badges[] = ['key' => 'cv', 'label' => 'Premier CV', 'icon' => 'file', 'earned' => true];
        } else {
            $badges[] = ['key' => 'cv', 'label' => 'Premier CV', 'icon' => 'file', 'earned' => false];
        }

        if ($appCount >= 1) {
            $badges[] = ['key' => 'first_application', 'label' => 'Première candidature', 'icon' => 'star', 'earned' => true];
        } else {
            $badges[] = ['key' => 'first_application', 'label' => 'Première candidature', 'icon' => 'star', 'earned' => false];
        }

        if ($interviewCount >= 1) {
            $badges[] = ['key' => 'first_interview', 'label' => 'Premier entretien', 'icon' => 'rocket', 'earned' => true];
        } else {
            $badges[] = ['key' => 'first_interview', 'label' => 'Premier entretien', 'icon' => 'rocket', 'earned' => false];
        }

        if ($favCount >= 5) {
            $badges[] = ['key' => 'favorites', 'label' => '5 favoris', 'icon' => 'heart', 'earned' => true];
        } else {
            $badges[] = ['key' => 'favorites', 'label' => '5 favoris', 'icon' => 'heart', 'earned' => false];
        }

        if ($activeInternshipCount > 0) {
            $badges[] = ['key' => 'active_internship', 'label' => 'Stage en cours', 'icon' => 'briefcase', 'earned' => true];
        }
        if ($hasCompletedInternship) {
            $badges[] = ['key' => 'completed_internship', 'label' => 'Stage terminé', 'icon' => 'check-circle', 'earned' => true];
        }

        // Tip of the day
        $tips = [
            'Ajoutez une photo professionnelle pour augmenter vos chances de recevoir des réponses.',
            'Les profils complétés à 100 % reçoivent 3 fois plus de vues.',
            'Personnalisez chaque lettre de motivation pour maximiser vos chances.',
            'Actualisez votre profil régulièrement pour rester visible.',
            'Une bonne description de vos compétences attire les recruteurs.',
            'N\'hésitez pas à contacter les entreprises qui vous intéressent.',
            'Mettez à jour votre CV avant de postuler à une offre.',
            'Les étudiants avec un profil complet trouvent un stage plus rapidement.',
            'Ajoutez les compétences demandées dans les offres pour augmenter votre score de correspondance.',
            'Un stage terminé est un vrai + sur votre CV — pensez à le valoriser.',
        ];
        $tip = $tips[array_rand($tips)];

        return response()->json([
            'firstname' => $user->firstname,
            'completion' => $completion,
            'missing_steps' => $missingSteps,
            'achieved_steps' => $achievedSteps,
            'stats' => [
                'applications' => $appCount,
                'favorites' => $favCount,
                'interviews' => $interviewCount,
                'recommendations_total' => $internships->count(),
                'active_internships' => $activeInternshipCount,
                'completed_internships' => $hasCompletedInternship ? $user->activeInternships->where('status', 'completed')->count() : 0,
            ],
            'recommendations' => $recommendations,
            'badges' => $badges,
            'tip' => $tip,
            'employment' => $profile ? [
                'is_employed' => $profile->is_employed ?? false,
                'job_title' => $profile->job_title,
                'employer' => $profile->employer,
                'employed_at' => $profile->employed_at,
            ] : null,
            'active_internship' => $user->activeInternships->where('status', 'in_progress')->first() ? [
                'id' => $user->activeInternships->where('status', 'in_progress')->first()->id,
                'internship_id' => $user->activeInternships->where('status', 'in_progress')->first()->internship_id,
                'title' => $user->activeInternships->where('status', 'in_progress')->first()->internship->title ?? null,
                'company' => $user->activeInternships->where('status', 'in_progress')->first()->internship->company->name ?? null,
                'start_date' => $user->activeInternships->where('status', 'in_progress')->first()->start_date,
            ] : null,
        ]);
    }

    private function computeCompletion($profile, $user): int
    {
        if (!$profile) return 0;

        $score = 0;
        if ($profile->photo || $profile->photo_url) $score += 10;
        if ($user->firstname) $score += 5;
        if ($user->lastname) $score += 5;
        if ($profile->phone || $user->phone) $score += 5;
        if ($profile->birth_date) $score += 5;
        if ($profile->gender) $score += 5;
        if ($profile->city_id || $profile->commune_id) $score += 5;
        if ($profile->address) $score += 5;
        if ($profile->school) $score += 8;
        if ($profile->major) $score += 7;
        if ($profile->graduation_year) $score += 5;
        if (!$user->skills->isEmpty()) $score += 15;
        if ($profile->languages) $score += 8;
        if ($profile->github) $score += 3;
        if ($profile->linkedin) $score += 3;
        if ($profile->portfolio) $score += 3;
        if ($profile->bio) $score += 4;
        if ($profile->cv_path) $score += 5;

        return min(100, $score);
    }
}
