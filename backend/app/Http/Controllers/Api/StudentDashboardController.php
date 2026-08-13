<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
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
        $user->load(['studentProfile', 'skills', 'applications', 'activeInternships.internship.company']);

        $profile = $user->studentProfile;

        // Completion
        $completion = $this->computeCompletion($profile, $user);

        // Missing/achieved steps (8 categories = 100 pts)
        $steps = [
            'photo'       => (bool) ($profile->photo || $profile->photo_url),
            'cv'          => (bool) $profile->cv_path,
            'bio'         => (bool) $profile->bio,
            'formation'   => (bool) ($profile->school && $profile->major),
            'skills'      => !$user->skills->isEmpty(),
            'languages'   => is_array($profile->languages) && count($profile->languages) > 0,
            'location'    => (bool) ($profile->commune_id || $profile->city_id),
            'links'       => (bool) ($profile->github || $profile->linkedin || $profile->portfolio),
        ];
        $missingSteps = array_keys(array_filter($steps, fn($v) => !$v));
        $achievedSteps = array_keys(array_filter($steps));

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

        $allSkillsMap = \App\Models\Skill::pluck('name')->mapWithKeys(fn($n) => [mb_strtolower($n) => $n])->toArray();

        $internships = Internship::with(['category', 'company'])
            ->where('status', 'published')
            ->whereDoesntHave('applications', fn($q) => $q->where('student_id', $user->id))
            ->take(50)
            ->get();

        $scored = $internships->map(function ($internship) use ($skillNames, $major, $user, $allSkillsMap) {
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
            foreach ($allSkillsMap as $lower => $original) {
                if (!in_array($lower, $skillNames) && str_contains($internshipText, $lower)) {
                    $missingSuggestions[] = $original;
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

        $profileViews = ActivityLog::where('action', 'profile_view')
            ->where('subject_type', \App\Models\User::class)
            ->where('subject_id', $user->id)
            ->count();
        $cvViews = ActivityLog::where('action', 'cv_download')
            ->where('subject_type', \App\Models\User::class)
            ->where('subject_id', $user->id)
            ->count();

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
                'profile_views' => $profileViews,
                'cv_views' => $cvViews,
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
            'active_internship' => (function () use ($user) {
                $active = $user->activeInternships->firstWhere('status', 'in_progress');
                if (!$active) return null;
                return [
                    'id' => $active->id,
                    'internship_id' => $active->internship_id,
                    'title' => $active->internship->title ?? null,
                    'company' => $active->internship->company->name ?? null,
                    'start_date' => $active->start_date,
                ];
            })(),
        ]);
    }

    private function computeCompletion($profile, $user): int
    {
        if (!$profile) return 0;

        $score = 0;

        // Photo: 10 pts
        if ($profile->photo || $profile->photo_url) $score += 10;

        // CV: 20 pts
        if ($profile->cv_path) $score += 20;

        // Bio: 10 pts
        if ($profile->bio) $score += 10;

        // Formation (school + major): 15 pts
        if ($profile->school && $profile->major) $score += 15;

        // Compétences: 20 pts
        if (!$user->skills->isEmpty()) $score += 20;

        // Langues: 10 pts
        if (is_array($profile->languages) && count($profile->languages) > 0) $score += 10;

        // Localisation: 10 pts
        if ($profile->commune_id || $profile->city_id) $score += 10;

        // Liens (github|linkedin|portfolio): 5 pts
        if ($profile->github || $profile->linkedin || $profile->portfolio) $score += 5;

        return min(100, $score);
    }
}
