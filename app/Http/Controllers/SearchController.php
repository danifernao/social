<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controlador responsable de gestionar la búsqueda global.
 * Permite buscar usuarios y publicaciones, incluyendo búsquedas por hashtags.
 */
class SearchController extends Controller
{
    /**
     * Muestra los resultados de búsqueda de usuarios o publicaciones.
     * También permite realizar búsquedas por hashtag.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function index(Request $request)
    {
        // Tipo de recurso a buscar: "post" o "user".
        $type = $request->get('type', 'post');

        // Término de búsqueda decodificado y sin espacios extra.
        $query = urldecode(trim($request->get('query', '')));

        // Cursor utilizado para la paginación.
        $cursor = $request->header('X-Cursor');

        // Usuario autenticado.
        $auth_user = $request->user(); 

        // IDs de usuarios que deben excluirse de los resultados
        // debido a bloqueos en cualquier dirección.
        $excluded_ids = $auth_user->excludedUserIds();

        /**
         * =====================
         * BÚSQUEDA DE USUARIOS
         * =====================
         */     
        if ($type === 'user') {
            // Construye la consulta de usuarios filtrando por nombre
            // de usuario y excluyendo perfiles bloqueados.
            $users = User::with('permission')
                ->when($query, fn ($q) =>
                    $q->where('username', 'like', "%{$query}%")
                )
                ->whereNotIn('id', $excluded_ids)
                ->orderBy('username')
                ->cursorPaginate(15, ['*'], 'cursor', $cursor);

            // Extrae los IDs de los usuarios obtenidos.
            $user_ids = $users->pluck('id');

            // Obtiene los IDs de los usuarios seguidos por
            // el usuario autenticado dentro del resultado.
            $followed_ids = $auth_user->follows()
                ->whereIn('followed_id', $user_ids)
                ->pluck('followed_id')
                ->toArray();

            // Agrega la propiedad "is_followed" a cada usuario,
            // indicando si el usuario autenticado lo sigue.
            $users->setCollection(
                $users->getCollection()
                    ->map(function ($user) use ($auth_user, $followed_ids) {
                        $user->is_followed = $auth_user->id !== $user->id
                            ? in_array($user->id, $followed_ids)
                            : null; // NULL cuando es el propio usuario.

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
         * ==========================
         * BÚSQUEDA DE PUBLICACIONES
         * ==========================
         */

        // Construye la consulta base de publicaciones,
        // excluyendo aquellas de usuarios bloqueados.
        $posts_query = Post::with(['user', 'user.permission'])
            ->withCount('comments')
            ->whereNotIn('user_id', $excluded_ids)
            ->latest();

        // Determina si el término de búsqueda corresponde
        // a una etiqueta (#hashtag).
        if (preg_match('/^#[a-z0-9]+$/i', $query)) {
            // Elimina el prefijo "#" del término de búsqueda para obtener
            // únicamente el nombre del hashtag.
            $hashtag = ltrim($query, '#');

            // Filtra publicaciones asociadas al hashtag indicado.
            $posts_query->whereHas('hashtags', fn ($q) =>
                $q->where('name', mb_strtolower($hashtag))
            );
        } elseif ($query) {
            // Si no es un hashtag, realiza una búsqueda parcial
            // dentro del contenido de las publicaciones.
            $posts_query->where('content', 'like', "%{$query}%");
        }

        // Obtiene las publicaciones usando paginación por cursor.
        $posts = $posts_query->cursorPaginate(7, ['*'], 'cursor', $cursor);

        // Agrega el resumen de reacciones a cada publicación.
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