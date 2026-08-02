<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;

class AdminSecurityController extends Controller
{
    public function secretsStatus(): JsonResponse
    {
        $secrets = config('secrets.keys', []);

        $status = [];
        foreach ($secrets as $key => $config) {
            $value = env($key);
            $status[] = [
                'key' => $key,
                'description' => $config['description'],
                'category' => $config['category'],
                'rotation' => $config['rotation'],
                'configured' => !empty($value) && $value !== 'null',
                'masked' => $value ? substr($value, 0, 4) . str_repeat('*', max(0, strlen($value) - 8)) . substr($value, -4) : null,
            ];
        }

        return response()->json([
            'secrets' => $status,
            'gitignore_ok' => $this->checkGitignore(),
            'env_not_versioned' => !file_exists(base_path('../.git')) || !shell_exec('git ls-files .env 2>/dev/null'),
        ]);
    }

    public function runSecretsCheck(): JsonResponse
    {
        $output = Artisan::call('secrets:check');
        $result = Artisan::output();

        return response()->json([
            'exit_code' => $output,
            'output' => $result,
            'passed' => $output === 0,
        ]);
    }

    private function checkGitignore(): bool
    {
        $gitignorePath = base_path('../.gitignore');
        $backendGitignore = base_path('.gitignore');

        $patterns = ['.env', '.env.backup', '.env.production'];

        foreach ([$gitignorePath, $backendGitignore] as $path) {
            if (!file_exists($path)) {
                return false;
            }
            $content = file_get_contents($path);
            foreach ($patterns as $pattern) {
                if (!str_contains($content, $pattern)) {
                    return false;
                }
            }
        }

        return true;
    }
}
