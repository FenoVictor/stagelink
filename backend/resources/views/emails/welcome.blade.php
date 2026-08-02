<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Bienvenue sur StageLink</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Open Sans', Arial, Helvetica, sans-serif; background-color: #f4f7fc; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fc; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

                    <!-- Header avec logo -->
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
                            <p style="margin: 12px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.8); font-weight: 400;">Bienvenue sur la plateforme</p>
                        </td>
                    </tr>

                    <!-- Contenu -->
                    <tr>
                        <td style="padding: 36px 32px;">
                            <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b; line-height: 1.6;">Bonjour <strong>{{ $user->name }}</strong>,</p>
                            <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b; line-height: 1.6;">Nous sommes ravis de vous accueillir sur <strong>StageLink</strong> ! Votre compte a été créé avec succès.</p>

                            @if($user->role === 'student')
                            <p style="margin: 0 0 20px 0; font-size: 15px; color: #1e293b; line-height: 1.6;">En tant qu'étudiant, vous pouvez :</p>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 10px 16px; background-color: #f0f9ff; border-radius: 8px; margin-bottom: 8px;">
                                        <p style="margin: 0; font-size: 14px; color: #1e293b;">Rechercher et postuler à des offres de stage</p>
                                    </td>
                                </tr>
                                <tr><td style="height: 8px;"></td></tr>
                                <tr>
                                    <td style="padding: 10px 16px; background-color: #f0f9ff; border-radius: 8px;">
                                        <p style="margin: 0; font-size: 14px; color: #1e293b;">Créer votre profil et partager votre CV</p>
                                    </td>
                                </tr>
                                <tr><td style="height: 8px;"></td></tr>
                                <tr>
                                    <td style="padding: 10px 16px; background-color: #f0f9ff; border-radius: 8px;">
                                        <p style="margin: 0; font-size: 14px; color: #1e293b;">Échanger directement avec les entreprises</p>
                                    </td>
                                </tr>
                            </table>
                            @else
                            <p style="margin: 0 0 20px 0; font-size: 15px; color: #1e293b; line-height: 1.6;">En tant qu'entreprise, vous pouvez :</p>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 10px 16px; background-color: #f0f9ff; border-radius: 8px;">
                                        <p style="margin: 0; font-size: 14px; color: #1e293b;">Publier des offres de stage</p>
                                    </td>
                                </tr>
                                <tr><td style="height: 8px;"></td></tr>
                                <tr>
                                    <td style="padding: 10px 16px; background-color: #f0f9ff; border-radius: 8px;">
                                        <p style="margin: 0; font-size: 14px; color: #1e293b;">Recevoir et gérer les candidatures</p>
                                    </td>
                                </tr>
                                <tr><td style="height: 8px;"></td></tr>
                                <tr>
                                    <td style="padding: 10px 16px; background-color: #f0f9ff; border-radius: 8px;">
                                        <p style="margin: 0; font-size: 14px; color: #1e293b;">Programmer des entretiens</p>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Bouton CTA -->
                            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #0369A1;">
                                        <a href="{{ config('app.frontend_url') }}/login" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; font-family: 'Poppins', Arial, sans-serif; border-radius: 8px; background-color: #0369A1;">
                                            Accéder à mon compte
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
