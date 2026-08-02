<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Nouvelle candidature reçue</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Open Sans', Arial, Helvetica, sans-serif; background-color: #f4f7fc; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fc; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

                    <!-- Header -->
                    <tr>
                        <td style="background-color: #0369A1; padding: 32px 24px; text-align: center;">
                            <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                                <tr>
                                    <td style="padding-right: 12px; vertical-align: middle;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 32 32" fill="none">
                                            <rect width="32" height="32" rx="8" fill="white" fill-opacity="0.15"/>
                                            <path d="M16 8L24 14V24H8V14L16 8Z" fill="white" opacity="0.9"/>
                                            <path d="M16 12L20 15V20H12V15L16 12Z" fill="#7DD3FC"/>
                                        </svg>
                                    </td>
                                    <td style="vertical-align: middle;">
                                        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; font-family: 'Poppins', Arial, sans-serif; letter-spacing: -0.3px;">StageLink</h1>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 12px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.8); font-weight: 400;">Nouvelle candidature reçue</p>
                        </td>
                    </tr>

                    <!-- Contenu -->
                    <tr>
                        <td style="padding: 36px 32px;">
                            <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b; line-height: 1.6;">Bonjour <strong>{{ $application->internship->company->name }}</strong>,</p>
                            <p style="margin: 0 0 20px 0; font-size: 15px; color: #1e293b; line-height: 1.6;">Un étudiant a postulé à votre offre de stage :</p>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 12px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; width: 140px; font-size: 13px;">Offre</td>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px;">{{ $application->internship->title }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; font-size: 13px;">Étudiant</td>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px;">{{ $application->student->name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px; background-color: #f8fafc; font-weight: 600; color: #475569; font-size: 13px;">Email</td>
                                    <td style="padding: 12px 16px; color: #1e293b; font-size: 14px;">{{ $application->student->email }}</td>
                                </tr>
                                @if($application->cover_letter)
                                <tr>
                                    <td style="padding: 12px 16px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-weight: 600; color: #475569; font-size: 13px;">Message</td>
                                    <td style="padding: 12px 16px; border-top: 1px solid #e2e8f0; color: #1e293b; font-size: 14px;">{{ $application->cover_letter }}</td>
                                </tr>
                                @endif
                            </table>

                            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #0369A1;">
                                        <a href="{{ config('app.frontend_url') }}/company/applications" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; font-family: 'Poppins', Arial, sans-serif; border-radius: 8px; background-color: #0369A1;">
                                            Voir les candidatures
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                                <tr>
                                    <td style="padding-right: 8px; vertical-align: middle;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" fill="none">
                                            <rect width="32" height="32" rx="8" fill="#0369A1"/>
                                            <path d="M16 8L24 14V24H8V14L16 8Z" fill="white" opacity="0.9"/>
                                            <path d="M16 12L20 15V20H12V15L16 12Z" fill="#0EA5E9"/>
                                        </svg>
                                    </td>
                                    <td style="vertical-align: middle;">
                                        <p style="margin: 0; font-size: 12px; color: #94a3b8;">StageLink &mdash; Toliara, Madagascar</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
