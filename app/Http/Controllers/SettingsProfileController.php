<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Rules\UserRules;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador responsable de la gestión del perfil del usuario.
 *
 * Permite mostrar y actualizar la información básica del perfil,
 * gestionar el avatar y eliminar la cuenta del usuario, aplicando
 * las validaciones y restricciones correspondientes.
 */
class SettingsProfileController extends Controller
{
    /**
     * Muestra la página de configuración del perfil del usuario.
     *
     * @param Request $request Datos de la petición HTTP.
     * @return Response        Respuesta Inertia con la vista del perfil.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile');
    }

    /**
     * Actualiza la información del perfil del usuario.
     *
     * Gestiona la actualización de datos personales, el cambio
     * o eliminación del avatar y la invalidación de la verificación
     * del correo si este fue modificado.
     *
     * @param Request           $request Datos validados del perfil.
     * @return RedirectResponse          Redirección tras actualizar el perfil.
     */
    public function update(Request $request): RedirectResponse
    {
        // Obtiene el usuario autenticado.
        $user = $request->user();

        // Valida los datos enviados desde el formulario.
        $data = $request->validate([
            'username' => UserRules::username($user->id),
            'email'    => UserRules::email($user->id),
            'avatar' => ['nullable', 'mimes:jpg,jpeg,png', 'max:2048'],
            'remove_avatar' => ['boolean'],
        ]);

        // Función anónima para eliminar el avatar existente.
        $deleteAvatar = fn() => 
            $user->avatar_path &&
            Storage::disk('public')->exists($user->avatar_path)
                ? Storage::disk('public')->delete($user->avatar_path)
                : null;

        // Elimina el avatar actual si el usuario lo solicitó.
        if ($data['remove_avatar']) {
            $deleteAvatar();
            $data['avatar_path'] = null;
        }

        // Procesa la carga de un nuevo avatar si fue enviado.
        if ($request->hasFile('avatar')) {
            $deleteAvatar();
            $data['avatar_path'] = $request
                ->file('avatar')
                ->store('avatars', 'public');
        }

        // Asigna los nuevos datos al modelo de usuario.
        $user->fill($data);

        // Detecta si el correo cambió.
        $emailChanged = $user->isDirty('email');


        // Si el correo fue modificado, invalida la verificación previa.
        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        // Guarda los cambios en la base de datos.
        $user->save();

        // Envía al correo del usuario el enlace de verificación solo
        // si la dirección cambió.
        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return to_route('profile.edit');
    }

    /**
     * Elimina la cuenta del usuario autenticado.
     *
     * Requiere confirmación de la contraseña y
     * prohíbe la eliminación de cuentas administrativas.
     *
     * @param Request           $request Datos de la petición HTTP.
     * @return RedirectResponse          Redirección tras eliminar la cuenta.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Valida los datos enviados desde el formulario.
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        // Obtiene el usuario autenticado.
        $user = $request->user();

        // Si el usuario es administrador, se prohíbe la eliminación.
        if ($user->isAdmin()) {
            return back()->withErrors([
                'password' => 'Esta cuenta es administrativa, no se puede eliminar.',
            ]);
        }

        // Cierra la sesión del usuario.
        Auth::logout();

        // Elimina definitivamente la cuenta.
        $user->delete();

        // Invalida la sesión y regenera el token CSRF.
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}