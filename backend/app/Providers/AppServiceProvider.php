<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Schema::defaultStringLength(191);

        RateLimiter::for('login', fn ($job) => Limit::perMinute(5)->by($job->user()?->id ?: $job->ip()));
        RateLimiter::for('register', fn ($job) => Limit::perMinute(3)->by($job->ip()));
        RateLimiter::for('forgot-password', fn ($job) => Limit::perMinute(3)->by($job->ip()));
        RateLimiter::for('feedback', fn ($job) => Limit::perMinute(5)->by($job->ip()));
    }
}
