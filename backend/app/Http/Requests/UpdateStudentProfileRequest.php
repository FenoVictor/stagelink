<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string',
            'school' => 'nullable|string|max:255',
            'major' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|integer|min:1950|max:2100',
            'diploma' => 'nullable|string|max:255',
            'current_level' => 'nullable|in:L1,L2,L3,M1,M2',
            'study_start' => 'nullable|integer|min:1950|max:2100',
            'study_end' => 'nullable|integer|min:1950|max:2100',
            'languages' => 'nullable|json',
            'github' => 'nullable|string|url|max:255',
            'portfolio' => 'nullable|string|url|max:255',
            'linkedin' => 'nullable|string|url|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'city_id' => 'nullable|exists:cities,id',
            'commune_id' => 'nullable|exists:communes,id',
            'neighborhood_id' => 'nullable|exists:neighborhoods,id',
            'address' => 'nullable|string|max:1000',
            'is_employed' => 'nullable|boolean',
            'job_title' => 'nullable|string|max:255',
            'employer' => 'nullable|string|max:255',
            'employed_at' => 'nullable|date',
            'firstname' => 'nullable|string|max:100',
            'lastname' => 'nullable|string|max:100',
            'skills' => 'nullable|array',
            'skills.*.id' => 'required|exists:skills,id',
            'skills.*.level' => 'nullable|string|max:50',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
            'photo' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:2048',
        ];
    }
}
