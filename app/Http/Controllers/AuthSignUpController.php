<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\User;
use App\Rules\UserRules;
use App\Utils\Locales;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
     * @param Request    $request  Datos de la petición HTTP.
     * @param string     $token    Token de invitación.
     * @return Response            Respuesta Inertia con la vista de 
     *                             registro de usuario.
     */
    public function create(Request $request, ?string $token = null): Response
    {
        return Inertia::render('auth/register', [
            'invitation_token' => $token
        ]);
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
            'token' => ['nullable', 'string'],
        ]);

        $user = DB::transaction(function () use ($request) {
            // Crea el nuevo usuario.
            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => User::exists() ? 'user' : 'admin',
                'language' => $request->language ?? head(Locales::codes()),
            ]);

            // Si se proporcionó un token, se consume la invitación.
            if ($request->filled('token')) {
                $invitation = Invitation::where('token', $request->token)
                    ->whereNull('used_by_id')
                    ->lockForUpdate()
                    ->firstOrFail();

                // Marca la invitación como utilizada.
                $invitation->update([
                    'used_by_id' => $user->id,
                    'used_at' => now(),
                ]);
            }

            return $user;
        });

        // Dispara el evento de usuario registrado.
        event(new Registered($user));

        // Autentica automáticamente al nuevo usuario.
        Auth::login($user);

        return to_route('home.index');
    }
}