<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Http\Resources\PageResource;
use App\Rules\SlugRule;
use App\Utils\Locales;
use App\Utils\SlugGenerator;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminPageController extends Controller
{
    /**
     * Muestra una lista paginada de páginas informativas.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function index(Request $request)
    {
        // Deniega acceso si el usuario autenticado no es administrador.
        if (!$request->user()->isAdmin()) {
            abort(403);
        }

        // Usa idioma pasado como parámetro de consulta o el del usuario autenticado.
        $language = $request->query('lang', $request->user()->language);

        // Valida que sea un idioma permitido, si no, usa el idioma del usuario.
        if (!in_array($language, Locales::codes(), true)) {
            $language = $request->user()->language;
        }

        $pages = Page::where('language', $language)
            ->latest()
            ->cursorPaginate(50)
            ->withQueryString();

        return inertia('admin/pages/index', [
            'pages' => PageResource::collection($pages),
            'language' => $language,
        ]);
    }

    /**
     * Muestra una página informativa específica.
     * 
     * @param string $lang Idioma de la página a mostrar.
     * @param string $slug Slug de la página a mostrar.
     */
    public function show(string $lang, string $slug)
    {
        $page = Page::where('language', $lang)
            ->where('slug', $slug)
            ->firstOrFail();

        return inertia('admin/pages/show', [
            'page' => (new PageResource($page))->resolve(),
        ]);
    }

    /**
     * Muestra el formulario para crear una nueva página informativa.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function create(Request $request)
    {
        // Deniega acceso si el usuario autenticado no es administrador.
        if (!$request->user()->isAdmin()) {
            abort(403);
        }

        return inertia('admin/pages/create');
    }

    /**
     * Crea una nueva página informativa.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function store(Request $request)
    {
        // Deniega acceso si el usuario autenticado no es administrador.
        if (!$request->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', new SlugRule()],
            'language' => ['required', 'string', 'in:' . implode(',', Locales::codes())],
            'content' => ['nullable', 'string'],
        ]);

        // Genera un slug válido y único.
        $validated['slug'] = SlugGenerator::generate(
            $validated['title'],
            $validated['slug'] ?? null,
            $validated['language'],
        );

        $page = new Page($validated);
        $page->language = $validated['language'];
        $page->save();

        return redirect()->route('admin.page.index', ['lang' => $page->language])
            ->with('message', 'Página creada.');
    }

    /**
     * Muestra el formulario para editar una página informativa existente.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Page $page Página que se va a editar.
     */
    public function edit(Request $request, Page $page)
    {
        // Deniega acceso si el usuario autenticado no es administrador.
        if (!$request->user()->isAdmin()) {
            abort(403);
        }

        return inertia('admin/pages/edit', [
            'page' => (new PageResource($page))->resolve(),
        ]);
    }

    /**
     * Actualiza una página informativa existente en la base de datos.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Page $page Página que se va a editar.
     */
    public function update(Request $request, Page $page)
    {
        // Deniega acceso si el usuario autenticado no es administrador.
        if (!$request->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', new SlugRule($page)],
            'content' => ['nullable', 'string'],
        ]);

        // Genera slug válido y único (ignorando la página actual).
        $validated['slug'] = SlugGenerator::generate(
            $validated['title'],
            $validated['slug'] ?? null,
            $page->language,
            $page->id,
        );

        $page->update($validated);

        return redirect()->route('admin.page.index', ['lang' => $page->language])
            ->with('message', 'Página actualizada.');
    }

    /**
     * Elimina una página informativa existente.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Page $page Página que se va a eliminar.
     */
    public function destroy(Request $request, Page $page)
    {
        // Deniega acceso si el usuario autenticado no es administrador.
        if (!$request->user()->isAdmin()) {
            abort(403);
        }

        $page->delete();

        return redirect()->route('admin.page.index', ['lang' => $page->language])
            ->with('message', 'Página eliminada.');
    }
}