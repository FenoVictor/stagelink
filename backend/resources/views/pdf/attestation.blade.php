<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Attestation de stage</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; line-height: 1.6; color: #1e293b; }
        .container { max-width: 700px; margin: 40px auto; padding: 40px; border: 2px solid #0369a1; border-radius: 8px; }
        h1 { text-align: center; color: #0369a1; font-size: 22px; margin-bottom: 8px; }
        .subtitle { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 30px; }
        .content { margin: 20px 0; }
        .content p { margin: 8px 0; }
        .label { font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        .date-city { text-align: right; margin-top: 30px; font-style: italic; }
        .signature { margin-top: 40px; }
        .signature-line { border-top: 1px solid #1e293b; width: 250px; margin-top: 40px; padding-top: 6px; font-size: 11px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Attestation de stage</h1>
        <p class="subtitle">StageLink — {{ $session->internship->company->name }}</p>

        <div class="content">
            <p><span class="label">Étudiant :</span> {{ $student->name ?? $student->firstname . ' ' . $student->lastname }}</p>
            @if($student->studentProfile && $student->studentProfile->school)
                <p><span class="label">Établissement :</span> {{ $student->studentProfile->school }}</p>
            @endif
            @if($student->studentProfile && $student->studentProfile->major)
                <p><span class="label">Filière :</span> {{ $student->studentProfile->major }}</p>
            @endif

            <p style="margin-top: 20px;"><span class="label">Stage :</span> {{ $session->internship->title }}</p>
            @if($session->internship->description)
                <p><span class="label">Description :</span> {{ Str::limit($session->internship->description, 200) }}</p>
            @endif
            <p><span class="label">Entreprise :</span> {{ $session->internship->company->name }}</p>
            @if($session->internship->location)
                <p><span class="label">Lieu :</span> {{ $session->internship->location }}</p>
            @endif

            <p style="margin-top: 20px;"><span class="label">Date de début :</span> {{ \Carbon\Carbon::parse($session->start_date)->format('d/m/Y') }}</p>
            <p><span class="label">Date de fin :</span> {{ \Carbon\Carbon::parse($session->end_date)->format('d/m/Y') }}</p>
            <p><span class="label">Durée :</span> {{ \Carbon\Carbon::parse($session->start_date)->diffInDays(\Carbon\Carbon::parse($session->end_date)) }} jours</p>
        </div>

        <p class="date-city">Fait à {{ $session->internship->location ?? 'Antananarivo' }}, le {{ now()->format('d/m/Y') }}</p>

        <div class="signature">
            <div class="signature-line">Signature et cachet de l'entreprise</div>
        </div>

        <div class="footer">
            <p>Cette attestation est délivrée par StageLink pour valider l'accomplissement du stage.</p>
            <p>Document généré le {{ now()->format('d/m/Y à H:i') }}</p>
        </div>
    </div>
</body>
</html>
