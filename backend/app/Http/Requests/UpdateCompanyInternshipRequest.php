<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyInternshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'requirements' => 'nullable|string',
            'location' => 'nullable|string',
            'type' => 'nullable|in:remote,onsite,hybrid',
            'duration' => 'nullable|string',
            'study_level' => 'nullable|string|max:100',
            'salary' => 'nullable|numeric|min:0',
            'slots' => 'nullable|integer|min:1',
            'deadline' => 'nullable|date',
            'status' => 'nullable|in:draft,published,closed,expired',
            'category_id' => 'nullable|exists:categories,id',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ];
    }
}
