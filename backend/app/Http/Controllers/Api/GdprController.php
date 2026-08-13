<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmAccountDeletionRequest;
use App\Models\ActivityLog;
use App\Models\Application;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Favorite;
use App\Models\InternshipStudent;
use App\Models\Message;
use App\Models\Notification;
use App\Models\StudentProfile;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GdprController extends Controller
{
    public function exportData(Request $request)
    {
        $user = $request->user()->load([
            'companyProfile',
            'studentProfile',
            'skills',
            'applications.internship',
            'favorites.internship',
            'conversations',
            'documents',
        ]);

        $data = [
            'export_date' => now()->toIso8601String(),
            'platform' => 'StageLink',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'email_verified_at' => $user->email_verified_at,
            ],
        ];

        if ($user->studentProfile) {
            $sp = $user->studentProfile;
            $data['student_profile'] = [
                'bio' => $sp->bio,
                'school' => $sp->school,
                'major' => $sp->major,
                'diploma' => $sp->diploma,
                'current_level' => $sp->current_level,
                'graduation_year' => $sp->graduation_year,
                'birth_date' => $sp->birth_date?->toDateString(),
                'gender' => $sp->gender,
                'city' => $sp->city?->name,
                'commune' => $sp->commune?->name,
                'neighborhood' => $sp->neighborhood?->name,
                'address' => $sp->address,
                'languages' => $sp->languages,
                'github' => $sp->github,
                'portfolio' => $sp->portfolio,
                'linkedin' => $sp->linkedin,
                'is_employed' => $sp->is_employed,
                'job_title' => $sp->job_title,
                'employer' => $sp->employer,
                'cv_uploaded_at' => $sp->cv_uploaded_at,
                'photo_uploaded' => $sp->photo !== null,
            ];
        }

        if ($user->companyProfile) {
            $cp = $user->companyProfile;
            $data['company_profile'] = [
                'name' => $cp->name,
                'description' => $cp->description,
                'website' => $cp->website,
                'location' => $cp->location,
                'industry' => $cp->industry,
                'employees_count' => $cp->employees_count,
                'phone' => $cp->phone,
                'verified_at' => $cp->verified_at,
            ];
        }

        $data['skills'] = $user->skills->map(fn($s) => [
            'name' => $s->name,
            'level' => $s->pivot->level,
        ]);

        $data['applications'] = $user->applications->map(fn($a) => [
            'internship_title' => $a->internship->title,
            'status' => $a->status,
            'relevance' => $a->relevance,
            'cover_letter' => $a->cover_letter ? 'Incluse' : null,
            'created_at' => $a->created_at,
        ]);

        $data['favorites'] = $user->favorites->map(fn($f) => [
            'internship_title' => $f->internship?->title,
            'created_at' => $f->created_at,
        ]);

        $data['conversations_count'] = $user->conversations->count();

        $data['messages_sent'] = Message::where('sender_id', $user->id)->count();

        $data['notifications_count'] = Notification::where('user_id', $user->id)->count();

        AuditService::log('gdpr_data_export', 'Export des données personnelles', $user);

        $filename = 'stagelink_donnees_' . now()->format('Y-m-d_His') . '.json';

        $headers = [
            'Content-Type' => 'application/json; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return response()->stream(function () use ($json) {
            echo $json;
        }, 200, $headers);
    }

    public function deleteAccount(ConfirmAccountDeletionRequest $request): JsonResponse
    {

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 422);
        }

        AuditService::log('gdpr_account_deletion', 'Demande de suppression de compte', $user);

        DB::beginTransaction();
        try {
            Message::where('sender_id', $user->id)->update([
                'message' => '[Message supprimé]',
                'file_path' => null,
                'file_name' => null,
                'file_size' => null,
            ]);

            ConversationParticipant::where('user_id', $user->id)->delete();

            Notification::where('user_id', $user->id)->delete();

            Favorite::where('student_id', $user->id)->delete();

            Application::where('student_id', $user->id)->update([
                'cover_letter' => null,
                'cv_path' => null,
                'cover_letter_path' => null,
            ]);

            InternshipStudent::where('student_id', $user->id)->delete();

            $sp = StudentProfile::where('user_id', $user->id)->first();
            if ($sp) {
                if ($sp->photo) {
                    Storage::disk('public')->delete($sp->photo);
                }
                if ($sp->cv_path) {
                    Storage::disk('public')->delete($sp->cv_path);
                }
                $sp->delete();
            }

            $user->skills()->detach();
            $user->tokens()->delete();

            $user->update([
                'name' => 'Compte supprimé',
                'firstname' => null,
                'lastname' => null,
                'email' => 'deleted_' . $user->id . '@stagelink.deleted',
                'password' => Hash::make(Str::random(64)),
                'phone' => null,
                'avatar' => null,
                'banned_at' => null,
            ]);

            $user->delete();

            DB::commit();

            return response()->json(['message' => 'Votre compte a été supprimé. Merci d\'avoir utilisé StageLink.']);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la suppression.'], 500);
        }
    }

    public function dataInfo(): JsonResponse
    {
        return response()->json([
            'retention' => [
                'account' => 'Conservé tant que le compte est actif. Suppression volontaire ou bannissement.',
                'applications' => 'Conservées 2 ans après la dernière candidature. Anonymisées après suppression du compte.',
                'messages' => 'Conservés 1 an. Contenu supprimé mais la conversation reste (anonymisée).',
                'notifications' => 'Supprimées lors de la suppression du compte.',
                'activity_logs' => 'Conservés 3 ans pour audit de sécurité. Anonymisés après suppression du compte.',
                'files' => 'CV et photo supprimés du serveur lors de la suppression du compte.',
            ],
            'your_data' => [
                'identity' => 'Nom, prénom, email, téléphone',
                'profile' => 'Bio, formation, compétences, localisation, photo, CV',
                'professional' => 'Candidatures, offres sauvegardées, entretiens',
                'communications' => 'Messages envoyés/reçus',
                'activity' => 'Historique de connexion, actions sur la plateforme',
                'technical' => 'Adresse IP, navigateur, système d\'exploitation',
            ],
            'rights' => [
                'access' => 'Vous pouvez télécharger l\'intégralité de vos données.',
                'rectification' => 'Vous pouvez modifier vos données via votre profil.',
                'deletion' => 'Vous pouvez supprimer votre compte et vos données.',
                'portability' => 'Vos données sont exportées en JSON standard.',
            ],
        ]);
    }
}
