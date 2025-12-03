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
        // Tipo de recurso a buscar: "post" o "user".
        $type = $request->get('type', 'post');

        // Término de búsqueda.
        $query = urldecode(trim($request->get('query', '')));
        // Cursor para paginación.
        $cursor = $request->header('X-Cursor');

        // Usuario autenticado.
        $auth_user = $request->user(); 

        // IDs de usuarios que deben excluirse de los resultados
        // debido a bloqueos.
        $excluded_ids = $auth_user->excludedUserIds();

        /**
         * BÚSQUEDA DE USUARIOS
         */
        
        if ($type === 'user') {
            // Construye la consulta de usuarios, filtrando por nombre
            // y excluyendo bloqueados.
            $users = User::query()
                ->when($query, fn ($q) =>
                    $q->where('username', 'like', "%{$query}%")
                )
                ->whereNotIn('id', $excluded_ids)
                ->orderBy('username')
                ->cursorPaginate(15, ['*'], 'cursor', $cursor);

            // Extrae los IDs de los usuarios obtenidos.
            $user_ids = $users->pluck('id');

            // Determina cuáles de esos usuarios son seguidos por
            // el usuario autenticado.
            $followed_ids = $auth_user->follows()
                ->whereIn('followed_id', $user_ids)
                ->pluck('followed_id')
                ->toArray();

            // Añade la propiedad is_followed para marcar si ya hay seguimiento.
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

        // Construye la consulta base de publicaciones, excluyendo las
        // publicaciones de usuarios bloqueados.
        $posts_query = Post::with('user')
            ->withCount('comments')
            ->whereNotIn('user_id', $excluded_ids) // Excluye publicaciones bloqueadas.
            ->latest();

        // Determina si la consulta corresponde a una etiqueta (#hashtag).
        if (preg_match('/^#[a-z0-9]+$/i', $query)) {
            $hashtag = ltrim($query, '#');

            // Filtra publicaciones que contengan la etiqueta indicada.
            $posts_query->whereHas('hashtags', fn ($q) =>
                $q->where('name', mb_strtolower($hashtag))
            );
        } elseif ($query) {
            // Si no es una etiqueta, busca publicaciones
            // cuyo contenido coincida parcialmente.
            $posts_query->where('content', 'like', "%{$query}%");
        }

        // Obtiene las publicaciones usando paginación por cursor.
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