<?php

namespace App\Http\Middleware;

use Closure;
use App\Utils\Locales;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware responsable de determinar y establecer el idioma
 * activo de la aplicación para cada solicitud.
 */
class HandleLanguage
{
    /**
     * Procesa la solicitud entrante y define el idioma activo de la aplicación.
     * 
     * @param Request $request Solicitud HTTP entrante.
     * @param Closure $next    Siguiente middleware.
     * @return Response        Respuesta HTTP.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Si el usuario está autenticado y tiene un idioma configurado,
        // se prioriza dicho idioma.
        if (Auth::check() && Auth::user()->language) {
            App::setLocale(Auth::user()->language);
        } else {
            // Obtiene el idioma preferido del navegador.
            $locale = $request->getPreferredLanguage();

            // Normaliza el idioma al formato ISO
            // de dos letras (ej. "en", "es").
            $locale = strtolower(substr($locale, 0, 2));

            // Si el idioma no está entre los habilitados,
            // se utiliza el idioma por defecto.
            if (!in_array($locale, Locales::codes())) {
                $locale = head(Locales::codes());
            }

            App::setLocale($locale);
        }
        
        return $next($request);
    }
}