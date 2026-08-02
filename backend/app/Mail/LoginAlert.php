<?php

namespace App\Mail;

use App\Models\LoginLog;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LoginAlert extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public LoginLog $loginLog,
        public ?LoginLog $previousLogin,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Alerte de sécurité — Nouvelle connexion détectée',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $user = $this->user;
        $log = $this->loginLog;
        $prev = $this->previousLogin;
        $name = $user->firstname ?: $user->name;

        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:40px;">
    <div style="text-align:center;margin-bottom:30px;">
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#0369A1"/><path d="M16 8L24 14V24H8V14L16 8Z" fill="white" opacity="0.9"/></svg>
        <h1 style="color:#0369A1;font-size:24px;margin:10px 0 0;">StageLink</h1>
    </div>
    
    <div style="background:#fef3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin-bottom:24px;">
        <h2 style="color:#856404;font-size:18px;margin:0;">⚠️ Connexion inhabituelle détectée</h2>
    </div>
    
    <p style="color:#333;font-size:15px;line-height:1.6;">
        Bonjour <strong>{$name}</strong>,
    </p>
    <p style="color:#333;font-size:15px;line-height:1.6;">
        Une connexion à votre compte a été effectuée depuis un appareil ou un emplacement que nous ne reconnaissons pas.
    </p>
    
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr><td style="padding:8px;color:#666;font-size:14px;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;font-size:14px;border-bottom:1px solid #eee;">{$user->email}</td></tr>
        <tr><td style="padding:8px;color:#666;font-size:14px;border-bottom:1px solid #eee;">Date/Heure</td><td style="padding:8px;font-size:14px;border-bottom:1px solid #eee;">{$log->created_at->format('d/m/Y à H:i')}</td></tr>
        <tr><td style="padding:8px;color:#666;font-size:14px;border-bottom:1px solid #eee;">Adresse IP</td><td style="padding:8px;font-size:14px;border-bottom:1px solid #eee;">{$log->ip_address}</td></tr>
        <tr><td style="padding:8px;color:#666;font-size:14px;border-bottom:1px solid #eee;">Navigateur</td><td style="padding:8px;font-size:14px;border-bottom:1px solid #eee;">{$log->browser}</td></tr>
        <tr><td style="padding:8px;color:#666;font-size:14px;border-bottom:1px solid #eee;">Appareil</td><td style="padding:8px;font-size:14px;border-bottom:1px solid #eee;">{$log->user_agent}</td></tr>
    </table>
    
    {$this->buildPreviousLoginSection($prev)}
    
    <p style="color:#333;font-size:15px;line-height:1.6;">
        Si ce n'était pas vous, <strong>changez votre mot de passe immédiatement</strong> et contactez le support.
    </p>
    
    <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
        <p style="color:#999;font-size:12px;">StageLink — Sécurité de votre compte</p>
    </div>
</div>
</body>
</html>
HTML;
    }

    private function buildPreviousLoginSection(?LoginLog $prev): string
    {
        if (!$prev) return '';
        return <<<HTML
<p style="color:#333;font-size:15px;line-height:1.6;">Dernière connexion connue :</p>
<table style="width:100%;border-collapse:collapse;margin:10px 0 20px;">
    <tr><td style="padding:6px 8px;color:#666;font-size:13px;">Date</td><td style="padding:6px 8px;font-size:13px;">{$prev->created_at->format('d/m/Y à H:i')}</td></tr>
    <tr><td style="padding:6px 8px;color:#666;font-size:13px;">IP</td><td style="padding:6px 8px;font-size:13px;">{$prev->ip_address}</td></tr>
    <tr><td style="padding:6px 8px;color:#666;font-size:13px;">Navigateur</td><td style="padding:6px 8px;font-size:13px;">{$prev->browser}</td></tr>
</table>
HTML;
    }
}
