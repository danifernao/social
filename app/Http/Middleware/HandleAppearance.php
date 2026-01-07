<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware responsable de gestionar la apariencia visual (claro, oscuro
 * o sistema) de la aplicación para cada solicitud.
 */
class HandleAppearance
{
    /**
     * Maneja una solicitud entrante.
     *
     * Obtiene el valor de la cookie "appearance" y lo
     * comparte con todas las vistas. Si no existe,
     * se utiliza "system" como valor por defecto.
     *
     * @param Request $request Solicitud HTTP entrante.
     * @param Closure $next    Siguiente middleware.
     * @return Response        Respuesta HTTP.
     */
    public function handle(Request $request, Closure $next): Response
    {
        View::share('appearance', $request->cookie('appearance') ?? 'system');

        return $next($request);
    }
}