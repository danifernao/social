<?php

namespace App\Http\Middleware;

use Closure;
use App\Utils\Locales;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class HandleLanguage
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        

        if (Auth::check() && Auth::user()->language) {
            App::setLocale(Auth::user()->language);
        } else {
            $locale = $request->getPreferredLanguage();
            $locale = strtolower(substr($locale, 0, 2));

            if (!in_array($locale, Locales::codes())) {
                $locale = config('app.fallback_locale');
            }

            App::setLocale($locale);
        }
        
        return $next($request);
    }
}
