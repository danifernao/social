<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador responsable de la gestión de sesiones de usuario.
 *
 * Permite mostrar el formulario de inicio de sesión, autenticar usuarios y
 * cerrar sesiones activas.
 */
class AuthSessionController extends Controller
{
    /**
     * Muestra la página de inicio de sesión.
     *
     * @param Request $request Datos de la petición HTTP.
     * @return Response        Respuesta Inertia con la vista de
     *                         inicio de sesión.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Maneja la autenticación del usuario.
     *
     * @param LoginRequest $request Datos validados del formulario de
     *                              inicio de sesión.
     * @return RedirectResponse     Redirección tras autenticarse correctamente.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Autentica al usuario.
        $request->authenticate();

        // Regenera la sesión para evitar fijación de sesión.
        $request->session()->regenerate();

        // Redirige al feed principal del usuario.
        return redirect()->intended(route('home.index', absolute: false));
    }

    /**
     * Cierra la sesión del usuario autenticado.
     *
     * @param Request           $request  Datos de la petición HTTP.
     * @return RedirectResponse           Redirección tras cerrar sesión.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Cierra la sesión actual.
        Auth::guard('web')->logout();

        // Invalida la sesión y regenera el token CSRF.
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}