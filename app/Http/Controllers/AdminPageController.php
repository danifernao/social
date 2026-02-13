<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Http\Resources\PageResource;
use App\Rules\SlugRule;
use App\Utils\Locales;
use App\Utils\PageUtils;
use App\Utils\SlugGenerator;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Controlador responsable de la gestión administrativa de páginas informativas.
 * Maneja el listado, creación, visualización, edición y eliminación de páginas.
 */
class AdminPageController extends Controller
{
    /**
     * Muestra una lista paginada de páginas informativas
     * según el idioma seleccionado.
     *
     * @param Request $request Datos de la petición HTTP.
     */
    public function index(Request $request)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de administrador.
        $this->authorize('access-admin-area');

        // Obtiene el idioma enviado como parámetro en la URL.
        $language = strtolower($request->query('lang'));

        // Si el idioma no es válido, se utiliza
        // el idioma del usuario autenticado.
        if (!in_array($language, Locales::codes(), true)) {
            $language = $request->user()->language;
        }

        // Obtiene las páginas informativas más recientes filtradas por idioma.
        $pages = Page::where('language', $language)
            ->latest()
            ->cursorPaginate(20)
            ->withQueryString();

        // Si la colección actual está vacía pero hay un cursor en la URL,
        // redirige a la primera página.
        if ($pages->isEmpty() && $request->has('cursor')) {
            return redirect()->route('admin.page.index', ['lang' => $language]);
        }

        return inertia('admin/pages/index', [
            'pages' => PageResource::collection($pages),
            'language' => $language,
        ]);
    }

    /**
     * Muestra una página informativa pública específica.
     *
     * @param string $lang Idioma de la página a mostrar.
     * @param string $slug Slug de la página a mostrar.
     */
    public function show(string $lang, string $slug)
    {
        // Busca la página por idioma y slug o lanza una excepción si no existe.
        $page = Page::where('language', $lang)
            ->where('slug', $slug)
            ->firstOrFail();

        return inertia('page/show', [
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
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de administrador.
        $this->authorize('access-admin-area');

        return inertia('admin/pages/create');
    }

    /**
     * Almacena una nueva página informativa en la base de datos.
     *
     * @param Request $request Datos de la petición HTTP.
     */
    public function store(Request $request)
    {
        // Valida los datos enviados desde el formulario.
        $validated = $request->validate([
            'language' => ['required', 'string', Rule::in(Locales::codes())],
            'type' => ['required', 'string', Rule::in(PageUtils::getTypes())],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', new SlugRule()],
            'content' => ['nullable', 'string'],
        ]);

        // Genera un slug válido y único a partir del título y el idioma.
        $validated['slug'] = SlugGenerator::generate(
            $validated['title'],
            $validated['slug'] ?? null,
            $validated['language'],
        );

        // Valida que no existan páginas duplicadas de tipo especial por idioma.
        if (in_array($validated['type'], PageUtils::getSpecialTypes(), true)) {
            if (
                Page::existsOfTypeInLanguage(
                    $validated['type'],
                    $validated['language']
                )
            ) {
                return back()->withErrors([
                    'type' => __('A page of this type already exists for this language.'),
                ]);
            }
        }

        // Crea y persiste la página informativa.
        $page = new Page($validated);
        $page->language = $validated['language'];
        $page->save();

        return redirect()->route(
            'admin.page.index',
            ['lang' => $page->language]
        )->with('message', __('Page successfully created.'));
    }

    /**
     * Muestra el formulario para editar una página informativa existente.
     *
     * @param Request $request Datos de la petición HTTP.
     * @param Page    $page    Instancia de la página que se va a editar.
     */
    public function edit(Request $request, Page $page)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de administrador.
        $this->authorize('access-admin-area');

        // Transforma la página utilizando PageResource para el frontend.
        $page_data = (new PageResource($page))->resolve();

        return inertia('admin/pages/edit', [
            'page' => $page_data,
        ]);
    }

    /**
     * Actualiza una página informativa existente.
     *
     * @param Request $request Datos de la petición HTTP.
     * @param Page    $page    Instancia de la página que se va a actualizar.
     */
    public function update(Request $request, Page $page)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de administrador.
        $this->authorize('access-admin-area');

        // Valida los datos enviados desde el formulario.
        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(PageUtils::getTypes())],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', new SlugRule($page)],
            'content' => ['nullable', 'string'],
        ]);

        // Genera un slug válido y único, ignorando la página actual.
        $validated['slug'] = SlugGenerator::generate(
            $validated['title'],
            $validated['slug'] ?? null,
            $page->language,
            $page->id,
        );

        // Valida que no existan páginas duplicadas de tipo especial por idioma.
        if (in_array($validated['type'], PageUtils::getSpecialTypes(), true)) {
            if (
                Page::existsOfTypeInLanguage(
                    $validated['type'],
                    $page->language, $page->id
                )
            ) {
                return back()->withErrors([
                    'type' => __('A page of this type already exists for this language.'),
                ]);
            }
        }

        // Actualiza los datos de la página informativa.
        $page->update($validated);

        return redirect()
            ->route('admin.page.index', [
                'lang' => $page->language,                
                'cursor' => $request->cursor,
            ])
            ->with('message', __('Page successfully updated.'));
    }

    /**
     * Elimina una página informativa existente.
     *
     * @param Request $request Datos de la petición HTTP.
     * @param Page    $page    Instancia de la página que se va a eliminar.
     */
    public function destroy(Request $request, Page $page)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de administrador.
        $this->authorize('access-admin-area');

        // Elimina la página informativa de la base de datos.
        $page->delete();

        return back()->with([
            'status' => 'page_deleted',
            'message' => __('Page successfully deleted.'),
        ]);
    }
}