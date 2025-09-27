<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleRegistrationAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $siteSettings = SiteSetting::first();

        if (!$siteSettings?->is_user_registration_enabled) {
            abort(403, 'El registro de usuarios está inhabilitado.');
        }

        return $next($request);
    }
}