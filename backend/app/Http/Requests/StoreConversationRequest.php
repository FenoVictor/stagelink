<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => 'nullable|exists:users,id',
            'company_id' => 'nullable|exists:users,id',
            'recipient_id' => 'nullable|exists:users,id',
            'message' => 'required|string|max:5000',
            'internship_id' => 'nullable|exists:internships,id',
        ];
    }
}
