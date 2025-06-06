<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        Route::bind('user', function ($value) {
            if (is_numeric($value)) {
                return User::findOrFail($value);
            }

            return User::where('username', $value)->firstOrFail();
        });
    }
}
