<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
        );

        $frontendVerifyUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/verify-email?token=' . urlencode($verificationUrl);

        return (new MailMessage)
            ->subject('Vérifiez votre adresse email — StageLink')
            ->greeting("Bienvenue sur StageLink, {$notifiable->name} !")
            ->line("Merci pour votre inscription. Pour accéder à toutes les fonctionnalités, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.")
            ->action('Vérifier mon email', $frontendVerifyUrl)
            ->line("Ce lien expire dans 60 minutes.")
            ->line("Si vous n'avez pas créé de compte sur StageLink, vous pouvez ignorer cet email.");
    }
}
