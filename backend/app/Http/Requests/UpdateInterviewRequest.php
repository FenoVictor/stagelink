<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInterviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'sometimes|date|after:now',
            'meeting_link' => 'nullable|url|max:255',
            'status' => 'sometimes|in:scheduled,completed,cancelled',
            'notes' => 'nullable|string|max:2000',
            'location' => 'nullable|string|max:255',
        ];
    }
}
