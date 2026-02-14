<?php

namespace App\Http\Middleware;

use App\Models\Invitation;
use App\Models\SiteSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleRegistrationAccess
{
    /**
     * Procesa la solicitud entrante y valida si el registro de usuarios
     * está permitido según la configuración del sitio o mediante
     * una invitación válida.
     *
     * @param Request $request Solicitud HTTP entrante.
     * @param Closure $next    Siguiente middleware.
     * @return Response        Respuesta HTTP.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Si el registro global está habilitado, se permite el acceso.
        if (SiteSetting::value('is_user_registration_enabled')) {
            return $next($request);
        }

        // Obtiene el token desde el segmento de la ruta.
        $token = $request->route('token');

        // Si no se proporciona token, se bloquea el acceso.
        if (!$token) {
            abort(403, __('User registration is disabled.'));
        }

        // Busca una invitación válida y no utilizada.
        $invitation_exists = Invitation::where('token', $token)
            ->whereNull('used_by_id')
            ->exists();

        // Si la invitación no existe o ya fue utilizada, se bloquea el acceso.
        if (!$invitation_exists) {
            abort(403, __('User registration is disabled.'));
        }

        // La invitación es válida, se permite el acceso al registro.
        return $next($request);
    }
}