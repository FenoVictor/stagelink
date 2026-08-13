<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompleteInternshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $startDate = $this->route('internshipStudent')?->start_date;

        return [
            'end_date' => 'required|date|after_or_equal:'.($startDate ? $startDate->format('Y-m-d') : '1970-01-01'),
            'feedback' => 'nullable|string',
        ];
    }
}
