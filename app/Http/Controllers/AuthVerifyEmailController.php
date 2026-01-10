<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
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
     * Si el usuario ya tiene el correo verificado, se redirige
     * a su feed principal.
     *
     * @param Request $request Datos de la petición HTTP.
     * @return Response|RedirectResponse
     */
    public function prompt(Request $request): Response|RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(
                route('home.index', absolute: false)
            );
        }

        return Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Reenvía el correo de verificación al usuario autenticado.
     *
     * Si el correo ya fue verificado previamente, se redirige
     * a su feed principal.
     *
     * @param Request $request Datos de la petición HTTP.
     * @return RedirectResponse
     */
    public function notify(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(
                route('home.index', absolute: false)
            );
        }

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
     * @return RedirectResponse
     */
    public function verify(
        EmailVerificationRequest $request
    ): RedirectResponse {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(
                route('home.index', absolute: false) . '?verified=1'
            );
        }

        if ($request->user()->markEmailAsVerified()) {
            /** @var \Illuminate\Contracts\Auth\MustVerifyEmail $user */
            $user = $request->user();

            event(new Verified($user));
        }

        return redirect()->intended(
            route('home.index', absolute: false) . '?verified=1'
        );
    }
}