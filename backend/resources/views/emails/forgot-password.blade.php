<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Réinitialisation du mot de passe</title>
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
                            <p style="margin: 12px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.8); font-weight: 400;">Réinitialisation du mot de passe</p>
                        </td>
                    </tr>

                    <!-- Contenu -->
                    <tr>
                        <td style="padding: 36px 32px;">
                            <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b; line-height: 1.6;">Bonjour,</p>
                            <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b; line-height: 1.6;">Vous avez demandé la réinitialisation de votre mot de passe sur <strong>StageLink</strong>.</p>
                            <p style="margin: 0 0 28px 0; font-size: 15px; color: #1e293b; line-height: 1.6;">Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

                            <!-- Bouton CTA -->
                            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #0369A1;">
                                        <a href="{{ $resetUrl }}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; font-family: 'Poppins', Arial, sans-serif; border-radius: 8px; background-color: #0369A1; mso-padding-alt: 0; text-align: center;">
                                            <span style="mso-text-raise: 15pt;">Réinitialiser mon mot de passe</span>
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Séparateur -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td style="border-top: 1px solid #e2e8f0; font-size: 0; line-height: 0;">&nbsp;</td>
                                </tr>
                            </table>

                            <!-- Infos sécurité -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                                <tr>
                                    <td style="padding: 16px; background-color: #fef9ee; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                        <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                                            <strong>Expiration :</strong> Ce lien est valide pendant <strong>60 minutes</strong>. Passé ce délai, vous devrez en faire la demande à nouveau.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 24px 0 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Aucune modification ne sera effectuée sur votre compte.</p>
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
