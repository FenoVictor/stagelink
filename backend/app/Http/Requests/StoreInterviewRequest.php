<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInterviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'application_id' => 'required|exists:applications,id',
            'date' => 'required|date|after:now',
            'meeting_link' => 'nullable|url|max:255',
            'notes' => 'nullable|string|max:2000',
            'location' => 'nullable|string|max:255',
        ];
    }
}
