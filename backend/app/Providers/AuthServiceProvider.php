<?php

namespace App\Providers;

use App\Models\Application;
use App\Models\Company;
use App\Models\Conversation;
use App\Models\Interview;
use App\Models\Internship;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use App\Policies\ApplicationPolicy;
use App\Policies\CompanyPolicy;
use App\Policies\ConversationPolicy;
use App\Policies\InterviewPolicy;
use App\Policies\InternshipPolicy;
use App\Policies\MessagePolicy;
use App\Policies\NotificationPolicy;
use App\Policies\StudentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        User::class => StudentPolicy::class,
        Company::class => CompanyPolicy::class,
        Application::class => ApplicationPolicy::class,
        Conversation::class => ConversationPolicy::class,
        Message::class => MessagePolicy::class,
        Notification::class => NotificationPolicy::class,
        Internship::class => InternshipPolicy::class,
        Interview::class => InterviewPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
