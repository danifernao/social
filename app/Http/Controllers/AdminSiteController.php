<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Traits\HandlesPasswordConfirmation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Controlador responsable de la gestión administrativa
 * de la configuración global del sitio.
 *
 * Permite visualizar y modificar ajustes sensibles del sistema,
 * aplicando control de acceso y confirmación de contraseña para acciones
 * privilegiadas.
 */
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
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de administrador.
        $this->authorize('access-admin-area');
        
        // Obtiene el registro de configuración del sitio.
        // Se asume que existe un único registro con los valores globales.
        $siteSettings = SiteSetting::firstOrFail();

        return Inertia::render('admin/site/edit', [
            'site_settings' => $siteSettings,
        ]);
    }

    /**
     * Procesa las acciones relacionadas con la gestión
     * de la configuración del sitio.
     *
     * Valida la acción solicitada, confirma la contraseña del administrador
     * y delega la ejecución a métodos específicos.
     *
     * @param Request $request Datos de la petición HTTP.
     */
    public function update(Request $request)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de administrador.
        $this->authorize('access-admin-area');
        
        // Valida los datos enviados desde el formulario.
        $request->validate([
            'action' => ['required', Rule::in(['toggle_user_registration'])],
            'privileged_password' => ['required', 'string'],
        ]);

        // Verifica que la contraseña ingresada por el
        // administrador sea correcta.
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
     * Habilita o inhabilita el registro de usuarios en el sitio.
     * Alterna el estado de disponibilidad de la página de registro de usuarios.
     */
    private function toggleUserRegistrationEnabled()
    {
        // Obtiene el registro de configuración del sitio.
        // Se asume que existe un único registro con los valores globales.
        $siteSettings = SiteSetting::firstOrFail();

        // Alterna el estado de habilitación del registro de usuarios.
        $siteSettings->is_user_registration_enabled =
            !$siteSettings->is_user_registration_enabled;

        $siteSettings->save();

        return back()->with(
            'status',
            $siteSettings->is_user_registration_enabled 
                ? 'user_registration_enabled' 
                : 'user_registration_disabled'
        );
    }
}