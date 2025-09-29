<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Traits\HandlesPasswordConfirmation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminSiteController extends Controller
{
    use HandlesPasswordConfirmation;

    /**
     * Muestra el formulario de edición de la configuración del sitio.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function edit(Request $request)
    {
        // Deniega acceso si el usuario autenticado no es administrador.
        if (!$request->user()->isAdmin()) {
            abort(403);
        }
        
        // Obtiene la configuración del sitio.
        $siteSettings = SiteSetting::firstOrFail();

        return Inertia::render('admin/site/edit', [
            'site_settings' => $siteSettings,
        ]);
    }

    /**
     * Procesa las acciones para la gestión de la configuración del sitio.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function update(Request $request)
    {
        // Deniega acceso si el usuario autenticado no es administrador.
        if (!$request->user()->isAdmin()) {
            abort(403);
        }
        
        $request->validate([
            'action' => ['required', Rule::in(['toggle_user_registration'])],
            'privileged_password' => ['required', 'string'],
        ]);

        // Verifica que la contraseña ingresada por el administrador sea la correcta.
        $this->confirmPassword($request->input('privileged_password'));

        // Ejecuta la acción correspondiente delegando a métodos específicos.
        switch ($request->action) {
            case 'toggle_user_registration':
                return $this->toggleUserRegistrationEnabled();
            default:
                return back()->with('status', 'no_action_performed');
        }
    }

    /**
     * Inhabilita / habilita la página de registro de usuario.
     */
    private function toggleUserRegistrationEnabled()
    {
        // Obtiene la configuración del sitio.
        $siteSettings = SiteSetting::firstOrFail();

        // Inhabilita o habilita la página de registro de usuario.
        $siteSettings->is_user_registration_enabled = !$siteSettings->is_user_registration_enabled;
        $siteSettings->save();

        return back()->with('status', $siteSettings->is_user_registration_enabled ? 'user_registration_enabled' : 'user_registration_disabled');
    }
}
