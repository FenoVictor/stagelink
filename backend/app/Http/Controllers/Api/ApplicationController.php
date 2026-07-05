<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $applications = Application::with(['internship.company'])
            ->where('student_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($applications);
    }

    public function store(Request $request, Internship $internship): JsonResponse
    {
        $request->validate([
            'cover_letter' => 'nullable|string',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
        ]);

        $existing = Application::where('internship_id', $internship->id)
            ->where('student_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already applied for this internship.'], 409);
        }

        $data = [
            'internship_id' => $internship->id,
            'student_id' => $request->user()->id,
            'cover_letter' => $request->cover_letter,
        ];

        if ($request->hasFile('cv')) {
            $data['cv_path'] = $request->file('cv')->store('cvs', 'public');
        }

        $application = Application::create($data);

        return response()->json($application, 201);
    }
}
