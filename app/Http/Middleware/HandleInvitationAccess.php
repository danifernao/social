<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleInvitationAccess
{
    /**
     * Procesa la solicitud entrante y valida si está permitido
     * gestionar invitaciones de registro de usuario.
     *
     * @param Request $request Solicitud HTTP entrante.
     * @param Closure $next    Siguiente middleware.
     * @return Response        Respuesta HTTP.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (SiteSetting::value('is_user_registration_enabled')) {
            abort(404);
        }

        return $next($request);
    }
}