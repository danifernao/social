<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    /**
     * Muestra los resultados de búsqueda de usuarios o publicaciones.
     * También permite buscar por hashtag.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function index(Request $request)
    {
        $type = $request->get('type', 'post'); // Tipo de búsqueda ("post" o "user").
        $query = urldecode(trim($request->get('query', ''))); // Término de búsqueda.
        $cursor = $request->header('X-Cursor'); // Cursor para paginación.
        $auth_user = $request->user(); // Usuario autenticado.

        // Se excluyen usuarios con bloqueos.
        $excluded_ids = $auth_user->excludedUserIds();

        /**
         * BÚSQUEDA DE USUARIOS
         */
        if ($type === 'user') {
            // Consulta de usuarios filtrando por nombre y excluyendo bloqueados.
            $users = User::query()
                ->when($query, fn ($q) =>
                    $q->where('username', 'like', "%{$query}%")) // Filtro por nombre de usuario.
                ->whereNotIn('id', $excluded_ids) // Excluye bloqueados.
                ->orderBy('username')
                ->cursorPaginate(15, ['*'], 'cursor', $cursor);

            // IDs de usuarios devueltos por la búsqueda.
            $user_ids = $users->pluck('id');

            // Verifica cuáles de esos usuarios son seguidos por el usuario autenticado.
            $followed_ids = $auth_user->follows()
                ->whereIn('followed_id', $user_ids)
                ->pluck('followed_id')
                ->toArray();

            // Añade propiedad is_followed al usuario para saber si el autenticado ya lo sigue.
            $users->setCollection(
                $users->getCollection()->map(function ($user) use ($auth_user, $followed_ids) {
                    $user->is_followed = $auth_user->id !== $user->id
                        ? in_array($user->id, $followed_ids)
                        : null; // NULL para sí mismo.

                    return $user;
                })
            );

            return Inertia::render('search/index', [
                'type' => 'user',
                'query' => $query,
                'results' => UserResource::collection($users),
            ]);
        }

        /**
         * BÚSQUEDA DE PUBLICACIONES
         */
        $posts_query = Post::with('user')
            ->withCount('comments')
            ->whereNotIn('user_id', $excluded_ids) // Excluye publicaciones bloqueadas.
            ->latest();

        // Verifica si el término de consulta es una etiqueta.
        if (preg_match('/^#[a-z0-9]+$/i', $query)) {
            // Filtra las publicaciones por la etiqueta dada.
            $hashtag = ltrim($query, '#');
            $posts_query->whereHas('hashtags', fn ($q) =>
                $q->where('name', mb_strtolower($hashtag))
            );
        } elseif ($query) {
            // Si no es una etiqueta, busca las publicaciones que contengan el término.
            $posts_query->where('content', 'like', "%{$query}%");
        }

        // Paginación con cursor.
        $posts = $posts_query->cursorPaginate(7, ['*'], 'cursor', $cursor);

        // Añade las reacciones a cada publicación.
        $posts->setCollection(
            $posts->getCollection()->map(function ($post) use ($auth_user) {
                $post->reactions = $post->reactionsSummary($auth_user->id);
                return $post;
            })
        );

        return Inertia::render('search/index', [
            'type' => 'post',
            'query' => $query,
            'results' => PostResource::collection($posts),
        ]);
    }
}