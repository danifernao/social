<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Utils\Locales;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SettingsLanguageController extends Controller
{
    /**
     * Muestra la página para cambiar el idioma de la interfaz.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function edit(Request $request)
    {
        $user = $request->user();

        return Inertia::render('settings/language', [
            'lang' => $user->language,
        ]);
    }

    /**
     * Cambia el idioma de la interfaz.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function update(Request $request)
    {
        $request->validate([
            'lang' => ['required', Rule::in(Locales::codes())],
        ]);

        $user = $request->user();
        $user->language = $request->lang;
        $user->save();

        return back()->with('status', 'language_changed');
    }
}