<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleRegistrationAccess
{
    /**
     * Procesa la solicitud entrante y valida si el registro de usuarios
     * está permitido según la configuración del sitio.
     *
     * @param Request $request Solicitud HTTP entrante.
     * @param Closure $next    Siguiente middleware.
     * @return Response        Respuesta HTTP.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Obtiene la configuración global del sitio.
        $siteSettings = SiteSetting::first();

        // Si el registro de usuarios está inhabilitado,
        // se bloquea el acceso con un error 403.
        if (!$siteSettings?->is_user_registration_enabled) {
            abort(403, __('User registration is disabled.'));
        }

        return $next($request);
    }
}