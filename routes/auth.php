<?php
use App\Http\Controllers\AuthPasswordConfirmController;
use App\Http\Controllers\AuthPasswordForgotController;
use App\Http\Controllers\AuthPasswordResetController;
use App\Http\Controllers\AuthSessionController;
use App\Http\Controllers\AuthSignUpController;
use App\Http\Controllers\AuthVerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('register', [AuthSignUpController::class, 'create'])
        ->middleware('registration.enabled')
        ->name('register');

    Route::post('register', [AuthSignUpController::class, 'store']);

    Route::get('login', [AuthSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthSessionController::class, 'store']);

    Route::get('forgot-password', [AuthPasswordForgotController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [AuthPasswordForgotController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [AuthPasswordResetController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [AuthPasswordResetController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', [AuthVerifyEmailController::class, 'prompt'])
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', [AuthVerifyEmailController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [AuthVerifyEmailController::class, 'notify'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [AuthPasswordConfirmController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [AuthPasswordConfirmController::class, 'store']);

    Route::post('logout', [AuthSessionController::class, 'destroy'])
        ->name('logout');
});
