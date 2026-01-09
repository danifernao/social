<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador responsable de la gestión de la contraseña del usuario.
 * Permite mostrar el formulario de cambio de contraseña y actualizarla.
 */
class SettingsPasswordController extends Controller
{
    /**
     * Muestra la página de configuración de contraseña del usuario.
     *
     * @return Response Respuesta Inertia con la vista correspondiente.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Actualiza la contraseña del usuario autenticado.
     *
     * Valida la contraseña actual, verifica que la nueva contraseña
     * cumpla con las reglas de seguridad y la almacena de forma
     * cifrada.
     *
     * @param Request  $request Datos de la petición HTTP.
     * @return RedirectResponse Redirección tras actualizar la contraseña.
     */
    public function update(Request $request): RedirectResponse
    {
        // Valida los datos enviados desde el formulario.
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        // Actualiza la contraseña del usuario autenticado.
        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back();
    }
}