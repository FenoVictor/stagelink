<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class AppAudit extends Command
{
    protected $signature = 'app:audit
                            {--fix : Tente de corriger automatiquement les vulnérabilités}
                            {--composer-only : Audit Composer uniquement}
                            {--npm-only : Audit npm uniquement}';
    protected $description = 'Audit complet des dépendances (Composer + npm)';

    public function handle(): int
    {
        $this->info('╔══════════════════════════════════════╗');
        $this->info('║   Audit de sécurité des dépendances  ║');
        $this->info('╚══════════════════════════════════════╝');
        $this->newLine();

        $exitCode = 0;

        if (!$this->option('npm-only')) {
            $composerResult = $this->auditComposer();
            if ($composerResult !== 0) {
                $exitCode = 1;
            }
        }

        if (!$this->option('composer-only')) {
            $npmResult = $this->auditNpm();
            if ($npmResult !== 0) {
                $exitCode = 1;
            }
        }

        $this->newLine();

        if ($exitCode === 0) {
            $this->info('✅ Aucune vulnérabilité critique détectée.');
        } else {
            $this->error('⚠️  Vulnérabilités détectées. Corrigez-les avant de release.');
            $this->newLine();
            $this->line('  Actions recommandées :');
            $this->line('  1. <fg=yellow>composer update</fg> pour les paquets PHP');
            $this->line('  2. <fg=yellow>npm audit fix</fg> pour les paquets JS');
            $this->line('  3. <fg=yellow>npm audit fix --force</fg> pour les breaking changes');
            $this->line('  4. Vérifiez les advisories sur https://github.com/advisories');
        }

        return $exitCode;
    }

    private function auditComposer(): int
    {
        $this->line('<fg=cyan>━━━ Composer Audit ━━━</>');
        $this->newLine();

        $process = new Process(['composer', 'audit', '--format=json'], base_path());
        $process->run();

        if ($process->isSuccessful()) {
            $this->line('  <fg=green>✅ Aucune vulnérabilité Composer</>');
            return 0;
        }

        $output = $process->getOutput();
        $decoded = json_decode($output, true);

        if ($decoded && isset($decoded['advisories'])) {
            $this->error('  ❌ ' . count($decoded['advisories']) . ' vulnérabilité(s) Composer :');
            $this->newLine();

            foreach ($decoded['advisories'] as $advisory) {
                $severity = $advisory['advisory']['severity'] ?? 'unknown';
                $title = $advisory['advisory']['title'] ?? 'Unknown';
                $package = $advisory['package']['name'] ?? 'unknown';

                $color = match($severity) {
                    'critical', 'high' => 'red',
                    'moderate' => 'yellow',
                    default => 'gray',
                };

                $this->line("    <fg={$color}>● [{$severity}]</> {$package}");
                $this->line("      {$title}");
            }
        } else {
            $this->error('  ' . $process->getOutput());
            $this->error('  ' . $process->getErrorOutput());
        }

        if ($this->option('fix')) {
            $this->newLine();
            $this->line('  <fg=cyan>Tentative de correction...</>');
            $fix = new Process(['composer', 'update'], base_path());
            $fix->run();
            if ($fix->isSuccessful()) {
                $this->line('  <fg=green>✅ Mise à jour effectuée</>');
            } else {
                $this->error('  ❌ Échec de la mise à jour');
            }
        }

        return $process->getExitCode();
    }

    private function auditNpm(): int
    {
        $this->line('<fg=cyan>━━━ npm Audit ━━━</>');
        $this->newLine();

        $frontendPath = base_path('../frontend');

        $process = new Process(['npm', 'audit', '--json'], $frontendPath);
        $process->run();

        $output = $process->getOutput();
        $decoded = json_decode($output, true);

        if ($decoded && isset($decoded['metadata']['vulnerabilities'])) {
            $vulns = $decoded['metadata']['vulnerabilities'];
            $total = $vulns['total'] ?? 0;

            if ($total === 0) {
                $this->line('  <fg=green>✅ Aucune vulnérabilité npm</>');
                return 0;
            }

            $this->error("  ❌ {$total} vulnérabilité(s) npm :");
            $this->newLine();

            $severityMap = [
                'critical' => 'red',
                'high' => 'red',
                'moderate' => 'yellow',
                'low' => 'gray',
            ];

            foreach (['critical', 'high', 'moderate', 'low'] as $sev) {
                $count = $vulns[$sev] ?? 0;
                if ($count > 0) {
                    $color = $severityMap[$sev] ?? 'gray';
                    $this->line("    <fg={$color}>● {$sev}</>: {$count}");
                }
            }

            if (isset($decoded['vulnerabilities'])) {
                $this->newLine();
                foreach ($decoded['vulnerabilities'] as $pkg => $info) {
                    $severity = $info['severity'] ?? 'unknown';
                    $title = $info['via'][0]['title'] ?? ($info['via'][0] ?? '');
                    $color = $severityMap[$severity] ?? 'gray';
                    $this->line("    <fg={$color}>● [{$severity}]</> {$pkg}");
                    if (is_string($title)) {
                        $this->line("      {$title}");
                    }
                }
            }
        } else {
            $exitCode = $process->getExitCode();
            if ($exitCode !== 0 && $process->getErrorOutput()) {
                $this->error('  ' . $process->getErrorOutput());
            }
        }

        if ($this->option('fix')) {
            $this->newLine();
            $this->line('  <fg=cyan>Tentative de correction...</>');
            $fix = new Process(['npm', 'audit', 'fix'], $frontendPath);
            $fix->run();
            if ($fix->isSuccessful()) {
                $this->line('  <fg=green>✅ Corrections appliquées</>');
            } else {
                $this->error('  ❌ Échec des corrections');
            }
        }

        return $decoded['metadata']['vulnerabilities']['total'] ?? $process->getExitCode();
    }
}
