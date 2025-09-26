<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteController extends Controller
{
    /**
     * Muestra el formulario de edición de la configuración del sitio.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function edit(Request $request)
    {
        // Si quien realiza la acción no es administrador, deniega el acceso.
        if (!$request->user()->isAdmin()) {
            return back()->withErrors([
                'message' => 'No tienes los permisos suficientes para cambiar el rol.',
            ]);
        }
        
        // Obtiene la única fila de configuración.
        $siteSettings = SiteSetting::first();

        return Inertia::render('admin/site/edit', [
            'site_settings' => $siteSettings,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        //
    }
}
