<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Finder\Finder;

class SecretsCheck extends Command
{
    protected $signature = 'secrets:check
                            {--fix : Affiche les suggestions de correction}
                            {--path= : Chemin à scanner (défaut : tout le projet)}';
    protected $description = 'Vérifie les secrets potentiellement exposés dans le code';

    public function handle(): int
    {
        $this->info('=== Vérification des secrets ===');
        $this->newLine();

        $paths = [
            $this->option('path') ?? base_path(),
        ];

        $excludes = [
            'vendor', 'node_modules', '.git', 'storage/framework',
            'storage/logs', 'bootstrap/cache', 'docs',
        ];

        $patterns = config('secrets.patterns', [
            '/APP_KEY=.+/',
            '/MAIL_PASSWORD=.+/',
            '/SENTRY_LARAVEL_DSN=.+/',
            '/REVERB_APP_SECRET=.+/',
            '/REVERB_APP_KEY=.+/',
            '/DB_PASSWORD=.+/',
        ]);

        $findings = [];

        foreach ($paths as $path) {
            $finder = new Finder();
            $finder->files()
                ->in($path)
                ->exclude($excludes)
                ->name(['*.php', '*.js', '*.jsx', '*.ts', '*.env*', '*.yml', '*.yaml', '*.json', '*.md'])
                ->notName(['*.lock', '*.min.js', 'package-lock.json', 'composer.lock'])
                ->depth('<5');

            foreach ($finder as $file) {
                $relativePath = str_replace($path, '', $file->getRealPath());
                $relativePath = ltrim($relativePath, DIRECTORY_SEPARATOR);
                $relativePath = str_replace('\\', '/', $relativePath);

                if ($this->isExcludedFile($relativePath)) {
                    continue;
                }

                $content = $file->getContents();
                $lines = explode("\n", $content);

                foreach ($patterns as $pattern) {
                    foreach ($lines as $lineNum => $line) {
                        if (preg_match($pattern, $line)) {
                            $findings[] = [
                                'file' => $relativePath,
                                'line' => $lineNum + 1,
                                'pattern' => $pattern,
                                'context' => trim(substr($line, 0, 100)),
                            ];
                        }
                    }
                }
            }
        }

        if (empty($findings)) {
            $this->info('✅ Aucun secret exposé détecté !');
            return Command::SUCCESS;
        }

        $this->error("⚠️  " . count($findings) . " secret(s) potentiellement exposé(s) :");
        $this->newLine();

        foreach ($findings as $i => $finding) {
            $this->line("  <fg=red>#{$i}</> <fg=yellow>{$finding['file']}:{$finding['line']}</>");
            $this->line("      <fg=gray>{$finding['context']}</>");
        }

        $this->newLine();
        $this->warn('Actions recommandées :');
        $this->line('  1. Déplacez les secrets dans .env');
        $this->line('  2. Ajoutez les fichiers dans .gitignore');
        $this->line('  3. Si commité, rotatez les secrets immédiatement');
        $this->line('  4. Exécutez : git log --all --full-history -- "* secrets"');

        return Command::FAILURE;
    }

    private function isExcludedFile(string $path): bool
    {
        $excluded = [
            '.env.example',
            'docs/',
            'README',
            'CHANGELOG',
            'AGENTS.md',
            'config/secrets.php',
            'Console/Commands/SecretsCheck.php',
        ];

        foreach ($excluded as $e) {
            if (str_starts_with($path, $e) || str_contains($path, $e)) {
                return true;
            }
        }

        return false;
    }
}
