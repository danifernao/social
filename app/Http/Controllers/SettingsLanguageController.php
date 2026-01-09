<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Utils\Locales;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Controlador responsable de la configuración del idioma de la interfaz.
 * Permite al usuario visualizar el idioma actual y actualizarlo.
 */
class SettingsLanguageController extends Controller
{
    /**
     * Muestra la página para cambiar el idioma de la interfaz.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function edit(Request $request)
    {
        // Obtiene el usuario autenticado.
        $user = $request->user();

        return Inertia::render('settings/language', [
            // Idioma actualmente configurado para el usuario.
            'lang' => $user->language,
        ]);
    }

    /**
     * Actualiza el idioma de la interfaz del usuario autenticado.
     *
     * Valida que el idioma enviado exista dentro del conjunto
     * de idiomas soportados por la aplicación.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function update(Request $request)
    {
        // Valida que el código de idioma sea válido.
        $request->validate([
            'lang' => ['required', Rule::in(Locales::codes())],
        ]);

        // Obtiene el usuario autenticado y actualiza su idioma.
        $user = $request->user();
        $user->language = $request->lang;
        $user->save();

        return back()->with('status', 'language_changed');
    }
}