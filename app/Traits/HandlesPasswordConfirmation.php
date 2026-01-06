<?php

namespace App\Traits;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/**
 * Proporciona lógica reutilizable para confirmar la contraseña
 * del usuario autenticado, aplicando limitación de intentos
 * para prevenir ataques de fuerza bruta.
 */
trait HandlesPasswordConfirmation
{
    /**
     * Verifica que la contraseña proporcionada coincida con la del
     * usuario autenticado y controla los intentos fallidos.
     *
     * @param string $password      Contraseña ingresada por el usuario.
     * @param int    $maxAttempts   Número máximo de intentos permitidos.
     * @param int    $decaySeconds  Tiempo en segundos antes de reiniciar
     *                              el contador de intentos.
     * @throws \Illuminate\Validation\ValidationException
     */
    public function confirmPassword(
        string $password,
        int $maxAttempts = 5,
        int $decaySeconds = 60
    ): void
    {
        $user = auth()->user();

        // Clave única por usuario para el control de intentos.
        $key = 'password-confirmation|' . $user->id;

        // Verifica si el usuario ha superado el número máximo
        // de intentos permitidos para confirmar la contraseña.
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'pass_confirmation' => __('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        // Si la contraseña es incorrecta, se registra el intento
        // fallido y se lanza una excepción de validación.
        if (!Hash::check($password, $user->password)) {
            RateLimiter::hit($key, $decaySeconds);

            throw ValidationException::withMessages([
                'pass_confirmation' => __(
                    'Password confirmation is incorrect.'
                ),
            ]);
        }

        // Si la contraseña es correcta, se limpian los intentos registrados.
        RateLimiter::clear($key);
    }
}