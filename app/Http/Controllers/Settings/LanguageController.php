<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;

class LanguageController extends Controller
{
    /**
     * Muestra la página para cambiar el idioma de la interfaz.
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
     */
    public function update(Request $request)
    {
        $request->validate([
            'lang' => 'required|in:es,en',
        ]);

        $user = $request->user();
        $user->language = $request->lang;
        $user->save();

        return back()->with('status', 'language_changed');
    }
}