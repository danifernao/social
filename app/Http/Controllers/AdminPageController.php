<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Http\Resources\PageResource;
use App\Utils\SlugGenerator;
use Illuminate\Http\Request;

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

        $pages = Page::latest()->cursorPaginate(50);

        return inertia('admin/pages/index', [
            'pages' => PageResource::collection($pages),
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
            'slug' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
        ]);

        // Genera un slug válido y único.
        $validated['slug'] = SlugGenerator::generate(
            $validated['slug'] ?? null,
            $validated['title']
        );

        Page::create($validated);

        return redirect()->route('admin.page.index')->with('message', 'Página creada.');
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
            'slug' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
        ]);

        // Genera slug válido y único (ignorando la página actual).
        $validated['slug'] = SlugGenerator::generate(
            $validated['slug'] ?? null,
            $validated['title'],
            $page->id
        );

        $page->update($validated);

        return redirect()->route('admin.page.index')->with('message', 'Página actualizada.');
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

        return redirect()->route('admin.page.index')->with('message', 'Página eliminada.');
    }
}