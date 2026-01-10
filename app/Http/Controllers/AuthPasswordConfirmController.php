<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador responsable de la confirmación de contraseña.
 *
 * Permite mostrar el formulario para confirmar la contraseña actual
 * y validar la contraseña del usuario antes de ejecutar acciones
 * sensibles.
 */
class AuthPasswordConfirmController extends Controller
{
    /**
     * Muestra el formulario para confirmar la contraseña del usuario.
     *
     * @return Response Respuesta Inertia con la vista de
     *                            confirmación de contraseña..
     */
    public function show(): Response
    {
        return Inertia::render('auth/confirm-password');
    }

    /**
     * Valida la contraseña ingresada por el usuario.
     *
     * Si la contraseña es correcta, se guarda la hora de confirmación
     * en la sesión; de lo contrario lanza una excepción de validación.
     *
     * @param Request             $request Datos de la petición HTTP.
     * @return RedirectResponse            Redirección tras
     *                                     confirmar contraseña.
     * @throws ValidationException         Si la contraseña es incorrecta.
     */
    public function store(Request $request): RedirectResponse
    {
        // Valida que la contraseña ingresada coincida
        // con la del usuario autenticado.
        if (! Auth::guard('web')->validate([
            'email' => $request->user()->email,
            'password' => $request->password,
        ])) {
            throw ValidationException::withMessages([
                'password' => __('auth.password'),
            ]);
        }

        // Guarda la hora de confirmación en la sesión.
        $request->session()->put('auth.password_confirmed_at', time());

        return redirect()->intended(route('home.index', absolute: false));
    }
}