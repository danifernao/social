<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware responsable de permitir el acceso únicamente a usuarios
 * cuyo correo electrónico aún no ha sido verificado.
 */
class EnsureEmailNotVerified
{
    /**
     * Maneja una solicitud entrante.
     *
     * Si el usuario ya tiene el correo verificado,
     * lo redirige a la página principal.
     *
     * @param Request $request Solicitud HTTP entrante.
     * @param Closure $next    Siguiente middleware.
     * @return Response        Respuesta HTTP.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Obtiene el usuario autenticado.
        $user = $request->user();

        // Verifica si el correo del usuario ya ha sido confirmado.
        if ($user && $user->hasVerifiedEmail()) {
            // Redirige al feed principal si ya está verificado.
            return redirect()->route('home.index');
        }

        return $next($request);
    }
}