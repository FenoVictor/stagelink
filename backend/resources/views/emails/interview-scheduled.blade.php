<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: 'Open Sans', Arial, sans-serif; background: #f4f7fc; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden;">
        <div style="background: #7c3aed; padding: 24px 32px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">Entretien programmé</h1>
        </div>
        <div style="padding: 32px;">
            <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Bonjour <strong>{{ $interview->application->student->name }}</strong>,</p>
            <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Un entretien a été programmé pour le stage <strong>{{ $interview->application->internship->title }}</strong> chez <strong>{{ $interview->application->internship->company->name }}</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; width: 140px;">Date</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #1e293b;">{{ $interview->date->format('d/m/Y à H:i') }}</td>
                </tr>
                @if($interview->location)
                <tr>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Lieu</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #1e293b;">{{ $interview->location }}</td>
                </tr>
                @endif
                @if($interview->meeting_link)
                <tr>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Lien visio</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #1e293b;"><a href="{{ $interview->meeting_link }}" style="color: #0369A1;">{{ $interview->meeting_link }}</a></td>
                </tr>
                @endif
                @if($interview->notes)
                <tr>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Notes</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #1e293b;">{{ $interview->notes }}</td>
                </tr>
                @endif
            </table>
            <div style="text-align: center; margin-top: 28px;">
                <a href="{{ config('app.frontend_url') }}/student" style="display: inline-block; background: #7c3aed; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Voir mes entretiens</a>
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 28px; text-align: center;">StageLink - Toliara, Madagascar</p>
        </div>
    </div>
</body>
</html>
