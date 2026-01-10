<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador responsable de generar los enlaces para restablecer
 * la contraseña de los usuarios.
 *
 * Permite mostrar el formulario para solicitar el enlace de restablecimiento
 * y enviarlo por correo electrónico si el usuario existe.
 */
class AuthPasswordForgotController extends Controller
{
    /**
     * Muestra la página para solicitar restablecer contraseña.
     *
     * @param Request $request Datos de la petición HTTP.
     * @return Response        Respuesta Inertia con la vista de
     *                         restablecimiento de contraseña.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Envía un enlace de restablecimiento de contraseña.
     *
     * @param Request           $request Datos de la petición HTTP.
     * @return RedirectResponse          Redirección con mensaje de estado.
     */
    public function store(Request $request): RedirectResponse
    {
        // Valida los datos enviados desde el formulario.
        $request->validate([
            'email' => 'required|email',
        ]);

        // Envía el enlace de restablecimiento de contraseña.
        Password::sendResetLink(
            $request->only('email')
        );

        return back()->with(
          'status',
          __('A reset link will be sent if the account exists.')
        );
    }
}