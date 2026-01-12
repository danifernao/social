<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Rules\UserRules;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador responsable del flujo completo de verificación
 * de correo electrónico.
 *
 * Gestiona la visualización del aviso de verificación, el reenvío del
 * correo de verificación y la confirmación final del correo.
 */
class AuthVerifyEmailController extends Controller
{
    /**
     * Muestra la vista que solicita al usuario verificar su correo electrónico.
     *
     * @param Request   $request Datos de la petición HTTP.
     * @return Response          Respuesta Inertia con la vista correspondiente.
     */
    public function prompt(Request $request): Response
    {
        return Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Reenvía el correo de verificación al usuario autenticado.
     *
     * @param Request   $request Datos de la petición HTTP.
     * @return RedirectResponse  Redirección de vuelta con status.
     */
    public function notify(Request $request): RedirectResponse
    {
        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification_link_sent');
    }

    /**
     * Marca el correo electrónico del usuario como verificado.
     *
     * Este método es invocado desde el enlace firmado enviado por correo.
     * Si el correo ya estaba verificado, simplemente redirige al usuario.
     *
     * @param EmailVerificationRequest $request Petición con firma válida.
     * @return RedirectResponse                 Redirección al feed principal
     *                                          tras la verificación.
     */
    public function verify(
        EmailVerificationRequest $request
    ): RedirectResponse {
        if ($request->user()->markEmailAsVerified()) {
            /** @var \Illuminate\Contracts\Auth\MustVerifyEmail $user */
            $user = $request->user();

            event(new Verified($user));
        }

        return redirect()->intended(
            route('home.index', absolute: false) . '?verified=1'
        );
    }

    /**
     * Muestra la vista para cambiar la dirección de correo electrónico.
     *
     * @param Request $request Datos de la petición HTTP.
     * @return Response        Respuesta Inertia con la vista correspondiente.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('auth/change-email');
    }

    /**
     * Cambia la direccón de correo electrónico.
     *
     * @param Request $request  Datos de la petición HTTP.
     * @return RedirectResponse Redirección a la página de aviso de
     *                          verificación.
     */
    public function update(Request $request): RedirectResponse
    {
        // Valida los datos enviados desde el formulario.
        $request->validate([
            'email' => UserRules::email(),
        ]);

        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Guarda los cambios.
        $auth_user->email = $request->email;

        // Si el correo cambió, guarda los cambios y envía el enlace de
        // verificación al nuevo correo.
        if ($auth_user->isDirty('email')) {
            $auth_user->save();
            $auth_user->sendEmailVerificationNotification();
        }

        return redirect()->intended(
            route('verification.notice', absolute: false)
        );
    }
}