<?php

use App\Http\Controllers\SettingsLanguageController;
use App\Http\Controllers\SettingsPasswordController;
use App\Http\Controllers\SettingsProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [SettingsProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [SettingsProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [SettingsProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [SettingsPasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [SettingsPasswordController::class, 'update'])->name('password.update');

    Route::get('settings/language', [SettingsLanguageController::class, 'edit'])->name('language.edit');
    Route::patch('settings/language', [SettingsLanguageController::class, 'update'])->name('language.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
