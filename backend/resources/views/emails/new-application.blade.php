<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: 'Open Sans', Arial, sans-serif; background: #f4f7fc; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden;">
        <div style="background: #0369A1; padding: 24px 32px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">Nouvelle candidature reçue</h1>
        </div>
        <div style="padding: 32px;">
            <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Bonjour <strong>{{ $application->internship->company->name }}</strong>,</p>
            <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Un étudiant a postulé à votre offre de stage :</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; width: 140px;">Offre</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #1e293b;">{{ $application->internship->title }}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Étudiant</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #1e293b;">{{ $application->student->name }}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Email</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #1e293b;">{{ $application->student->email }}</td>
                </tr>
                @if($application->cover_letter)
                <tr>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Message</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #1e293b;">{{ $application->cover_letter }}</td>
                </tr>
                @endif
            </table>
            <div style="text-align: center; margin-top: 28px;">
                <a href="{{ config('app.frontend_url') }}/company" style="display: inline-block; background: #0369A1; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Voir les candidatures</a>
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 28px; text-align: center;">StageLink - Toliara, Madagascar</p>
        </div>
    </div>
</body>
</html>
