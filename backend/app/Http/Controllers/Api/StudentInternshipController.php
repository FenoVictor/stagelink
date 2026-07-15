<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Internship;
use App\Models\InternshipStudent;
use App\Models\Notification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentInternshipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $internships = InternshipStudent::with(['internship.company'])
            ->where('student_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($internships);
    }

    public function start(Request $request, Internship $internship): JsonResponse
    {
        $application = Application::where('internship_id', $internship->id)
            ->where('student_id', $request->user()->id)
            ->where('status', 'accepted')
            ->first();

        if (!$application) {
            return response()->json(['message' => 'Vous devez avoir une candidature acceptée pour démarrer ce stage.'], 403);
        }

        $existing = InternshipStudent::where('internship_id', $internship->id)
            ->where('student_id', $request->user()->id)
            ->whereIn('status', ['in_progress', 'completed'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà un stage actif ou terminé pour cette offre.'], 409);
        }

        $validated = $request->validate([
            'start_date' => 'required|date',
        ]);

        $internshipStudent = InternshipStudent::create([
            'internship_id' => $internship->id,
            'student_id' => $request->user()->id,
            'start_date' => $validated['start_date'],
            'status' => 'in_progress',
        ]);

        Notification::create([
            'user_id' => $internship->company->user_id,
            'type' => 'internship',
            'title' => 'Stage démarré',
            'message' => $request->user()->name . ' a démarré son stage "' . $internship->title . '".',
        ]);

        $internshipStudent->load('internship.company');

        return response()->json($internshipStudent, 201);
    }

    public function complete(Request $request, InternshipStudent $internshipStudent): JsonResponse
    {
        if ($internshipStudent->student_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($internshipStudent->status !== 'in_progress') {
            return response()->json(['message' => 'Ce stage est déjà terminé.'], 409);
        }

        $validated = $request->validate([
            'end_date' => 'required|date|after_or_equal:' . $internshipStudent->start_date,
            'feedback' => 'nullable|string',
        ]);

        $internshipStudent->update([
            'end_date' => $validated['end_date'],
            'feedback' => $validated['feedback'] ?? null,
            'status' => 'completed',
        ]);

        $internshipStudent->load('internship.company');

        return response()->json($internshipStudent);
    }

    public function attestation(Request $request, InternshipStudent $internshipStudent)
    {
        if ($internshipStudent->student_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($internshipStudent->status !== 'completed') {
            return response()->json(['message' => 'Le stage doit être terminé pour générer une attestation.'], 409);
        }

        $internshipStudent->load(['internship.company', 'student.studentProfile']);

        $pdf = Pdf::loadView('pdf.attestation', [
            'student' => $internshipStudent->student,
            'internship' => $internshipStudent->internship,
            'session' => $internshipStudent,
        ]);

        $filename = 'attestation_' . $internshipStudent->internship->slug . '_' . $internshipStudent->student->id . '.pdf';

        return $pdf->download($filename);
    }
}
