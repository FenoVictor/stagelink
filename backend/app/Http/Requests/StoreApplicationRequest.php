<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cover_letter' => 'nullable|string',
            'cover_letter_file' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
        ];
    }
}
