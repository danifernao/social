<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador responsable de restablecer la contraseña de los usuarios.
 *
 * Permite mostrar el formulario de cambio de contraseña y procesar
 * el restablecimiento.
 */
class AuthPasswordResetController extends Controller
{
    /**
     * Muestra el formulario para restablecer la contraseña.
     *
     * @param Request $request Datos de la petición HTTP.
     * @return Response        Respuesta Inertia con la vista de
     *                         restablecimiento de contraseña.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Gestiona la solicitud de cambio de contraseña.
     *
     * Valida el token, email y la nueva contraseña. Si es correcto,
     * actualiza la contraseña del usuario y genera un nuevo token de sesión.
     *
     * @param Request           $request Datos de la petición HTTP.
     * @return RedirectResponse          Redirección tras restablecer
     *                                   la contraseña.
     * @throws ValidationException       Si hay errores de validación
     *                                   o token inválido.
     */
    public function store(Request $request): RedirectResponse
    {
        // Valida los datos enviados desde el formulario.
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Intenta restablecer la contraseña.
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Dispara el evento de contraseña restablecida.
                event(new PasswordReset($user));
            }
        );

        // Redirige si la contraseña se restableció correctamente.
        if ($status == Password::PasswordReset) {
            return to_route('login')->with('status', __($status));
        }

        // Si hubo un error, lanza una excepción de validación.
        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}