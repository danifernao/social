<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Rules\UserRules;
use App\Utils\Locales;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador responsable del registro de nuevos usuarios.
 *
 * Permite mostrar el formulario de registro, validar los datos
 * ingresados, crear la cuenta y autenticar automáticamente
 * al usuario recién registrado.
 */
class AuthSignUpController extends Controller
{
    /**
     * Muestra la página de registro de usuario.
     *
     * @return Response Respuesta Inertia con la vista de registro de usuario.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Registra un nuevo usuario.
     *
     * @param Request           $request Datos de la petición HTTP.
     * @return RedirectResponse          Redirección tras registrarse
     *                                   correctamente.
     */
    public function store(Request $request): RedirectResponse
    {
        // Valida los datos enviados desde el formulario.
        $request->validate([
            'username' => UserRules::username(),
            'email' => UserRules::email(),
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'language' => Rule::in(Locales::codes()),
        ]);

        // Crea el nuevo usuario en la base de datos.
        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => User::exists() ? 'user' : 'admin',
            'language' => $request->language ?? head(Locales::codes()),
        ]);

        // Dispara el evento de usuario registrado.
        event(new Registered($user));

        // Autentica automáticamente al nuevo usuario.
        Auth::login($user);

        return to_route('home.index');
    }
}