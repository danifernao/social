<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Traits\HandlesPasswordConfirmation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SiteController extends Controller
{
    use HandlesPasswordConfirmation;

    /**
     * Muestra el formulario de edición de la configuración del sitio.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function edit(Request $request)
    {
        // Si quien visita la página no es administrador, deniega el acceso.
        if (!$request->user()->isAdmin()) {
            return back()->withErrors([
                'message' => 'No tienes los permisos suficientes para realizar esta acción.',
            ]);
        }
        
        // Obtiene la única fila de configuración.
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
        // Si quien realiza la acción no es administrador, deniega el acceso.
        if (!$request->user()->isAdmin()) {
            return back()->withErrors([
                'message' => 'No tienes los permisos suficientes para realizar esta acción.',
            ]);
        }
        
        $request->validate([
            'action' => ['required', Rule::in(['toggle_user_registration'])],
            'privileged_password' => ['required', 'string'],
        ]);

        // Verifica que la contraseña ingresada por el administrador sea la correcta.
        $this->confirmPassword($request->input('privileged_password'));

        // Ejecuta la acción correspondiente.
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
        // Obtiene la única fila de configuración.
        $siteSettings = SiteSetting::firstOrFail();

        // Inhabilita o habilita la página de registro de usuario.
        $siteSettings->is_user_registration_enabled = !$siteSettings->is_user_registration_enabled;
        $siteSettings->save();

        return back()->with('status', $siteSettings->is_user_registration_enabled ? 'user_registration_enabled' : 'user_registration_disabled');
    }
}
