<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public Application $application;

    public function __construct(Application $application)
    {
        $this->application = $application;
    }

    public function envelope(): Envelope
    {
        $status = $this->application->status === 'accepted' ? 'acceptée' : 'refusée';
        return new Envelope(
            subject: 'Candidature ' . $status . ' - ' . $this->application->internship->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application-status-changed',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
