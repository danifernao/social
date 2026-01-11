<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Gestiona la validación y autenticación de las solicitudes
 * de inicio de sesión.
 * 
 * Esta clase se encarga de:
 * - Validar los campos 'email' y 'password'.
 * - Verificar las credenciales del usuario.
 * - Controlar los intentos fallidos mediante rate limiting.
 * - Iniciar sesión si las credenciales son correctas.
 */
class LoginRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Obtiene las reglas de validación que se aplican a la solicitud.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Intenta autenticar las credenciales de la solicitud.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        // Verifica que la solicitud no haya excedido los intentos permitidos.
        $this->ensureIsNotRateLimited();

        // Obtiene las credenciales de la solicitud.
        $credentials = $this->only('email', 'password');

        // Busca el usuario por correo electrónico.
        $user = User::where('email', $credentials['email'])->first();

        // Verifica si el usuario existe, está activo
        // y la contraseña es correcta.
        if (
            ! $user ||
            ! $user->is_active ||
            ! Hash::check($credentials['password'], $user->password)
        ) {
            RateLimiter::hit($this->throttleKey());

            // Mensaje específico si la cuenta está desactivada.
            if ($user && ! $user->is_active) {
                throw ValidationException::withMessages([
                    'email' => 'Tu cuenta está desactivada.',
                ]);
            }

            // Mensaje genérico de credenciales incorrectas.
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        // Si todo está correcto, inicia sesión con la opción de "recordarme".
        Auth::login($user, $this->boolean('remember'));

        // Limpia los intentos fallidos del rate limiter.
        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Verifica que la solicitud de inicio de sesión no esté limitada
     * por exceso de intentos.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        // Verifica si la clave de rate limiting NO ha superado el número máximo
        // de intentos permitidos (5). Si aún no se ha excedido el límite,
        // la ejecución continúa normalmente y no se aplica ningún bloqueo.
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        // Dispara el evento de bloqueo por exceso de intentos.
        event(new Lockout($this));

        // Obtiene la cantidad de segundos restantes antes de
        // que se levante el bloqueo.
        $seconds = RateLimiter::availableIn($this->throttleKey());

        // Mensaje que indica al usuario cuánto tiempo debe esperar
        // antes de intentar iniciar sesión nuevamente.
        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Obtiene la clave que se usa para el rate limiting de la solicitud.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(
            Str::lower($this->string('email')).'|'.$this->ip()
        );
    }
}