<?php

namespace App\Traits;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

trait HandlesPasswordConfirmation
{
    /**
     * Verifica que la contraseña proporcionada sea correcta para el usuario autenticado.
     * y aplica límites de intentos fallidos por seguridad.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function confirmPassword(string $password, int $maxAttempts = 5, int $decaySeconds = 60): void
    {
        $user = auth()->user();
        $key = 'password-confirmation|' . $user->id;

        // Verifica si el usuario ha superado los intentos permitidos.
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'pass_confirmation' => __('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        // Si la contraseña es incorrecta, registra un intento fallido.
        if (!Hash::check($password, $user->password)) {
            RateLimiter::hit($key, $decaySeconds);

            throw ValidationException::withMessages([
                'pass_confirmation' => 'La contraseña de confirmación es incorrecta.',
            ]);
        }

        // Si la contraseña fue correcta, limpia los intentos.
        RateLimiter::clear($key);
    }
}
