<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: 'Open Sans', Arial, sans-serif; background: #f4f7fc; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden;">
        <div style="background: {{ $application->status === 'accepted' ? '#16a34a' : '#dc2626' }}; padding: 24px 32px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">
                Candidature {{ $application->status === 'accepted' ? 'acceptée' : 'refusée' }}
            </h1>
        </div>
        <div style="padding: 32px;">
            <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Bonjour <strong>{{ $application->student->name }}</strong>,</p>
            @if($application->status === 'accepted')
                <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Félicitations ! Votre candidature pour le stage <strong>{{ $application->internship->title }}</strong> chez <strong>{{ $application->internship->company->name }}</strong> a été <strong style="color: #16a34a;">acceptée</strong>.</p>
                <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">L'entreprise vous contactera prochainement pour la suite du processus.</p>
            @else
                <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Votre candidature pour le stage <strong>{{ $application->internship->title }}</strong> chez <strong>{{ $application->internship->company->name }}</strong> a été <strong style="color: #dc2626;">refusée</strong>.</p>
                <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Ne vous découragez pas, continuez à postuler à d'autres offres sur StageLink.</p>
            @endif
            <div style="text-align: center; margin-top: 28px;">
                <a href="{{ config('app.frontend_url') }}/student" style="display: inline-block; background: #0369A1; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Voir mes candidatures</a>
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 28px; text-align: center;">StageLink - Toliara, Madagascar</p>
        </div>
    </div>
</body>
</html>
