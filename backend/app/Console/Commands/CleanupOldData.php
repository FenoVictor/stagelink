<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\Message;
use App\Models\Notification;
use App\Models\RequestMetric;
use Illuminate\Console\Command;

class CleanupOldData extends Command
{
    protected $signature = 'app:cleanup-data';

    protected $description = 'Nettoie les anciennes données selon la politique de rétention RGPD';

    public function handle(): int
    {
        $this->info('=== Nettoyage des données (RGPD) ===');

        $notificationsDeleted = Notification::where('created_at', '<', now()->subYear())->delete();
        $this->info("Notifications supprimées (>1 an) : {$notificationsDeleted}");

        $messagesAnonymized = Message::where('created_at', '<', now()->subYear())
            ->whereNotNull('message')
            ->update(['message' => '[Message archivé]']);
        $this->info("Messages anonymisés (>1 an) : {$messagesAnonymized}");

        $oldLogs = ActivityLog::where('created_at', '<', now()->subYears(3))
            ->whereNotNull('user_id')
            ->update([
                'user_id' => null,
                'ip_address' => null,
                'user_agent' => null,
                'browser' => null,
            ]);
        $this->info("Logs anonymisés (>3 ans) : {$oldLogs}");

        $requestMetricsDeleted = RequestMetric::where('created_at', '<', now()->subDays(7))->delete();
        $this->info("Request metrics purgées (>7 jours) : {$requestMetricsDeleted}");

        $this->info('=== Nettoyage terminé ===');

        return Command::SUCCESS;
    }
}
