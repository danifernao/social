<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controlador responsable de mostrar el feed principal del usuario autenticado.
 */
class HomeController extends Controller
{
    /**
     * Muestra el feed principal del usuario autenticado.
     *
     * - Si el usuario es moderador, se muestran todas las publicaciones.
     * - Si es un usuario normal, se muestran únicamente sus propias
     *   publicaciones y las de los usuarios que sigue.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function index(Request $request)
    {
        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Obtiene el cursor para la paginación.
        $cursor = $request->header('X-Cursor');

        // Determina el tipo de feed solicitado.
        $feed = $request->input('feed', 'following');

        // Obtiene el tipo de feed solicitado.
        $feed = $request->input('feed');

        // Define los tipos de feed permitidos.
        $allowed_feeds = ['following', 'all'];

        // Si el feed solicitado no es válido, se establece el feed por defecto.
        if (!in_array($feed, $allowed_feeds)) {
            $feed = 'following';
        }

        // Consulta base de las publicaciones.
        $query = Post::with(['user', 'profileOwner'])
            ->withCount('comments')
            ->visibleTo($auth_user);

        // Muestra únicamente las publicaciones del propio usuario,
        // las realizadas en su perfil y las de usuarios que sigue.
        if ($feed === "following") {
            $query->where(function ($q) use ($auth_user) {
                // Publicaciones propias del usuario autenticado.
                $q->where('user_id', $auth_user->id);

                // Publicaciones de usuarios que el autenticado sigue.
                $q->orWhere(function ($f) use ($auth_user) {
                    $f->whereIn('user_id', $auth_user->followedUserIds())
                      ->whereNull('profile_user_id');
                });

                // Publicaciones de otros en el perfil del usuario autenticado.
                $q->orWhere('profile_user_id', $auth_user->id);
            });
        }

        // Aplica la paginación basada en cursor.
        $posts = $query->latest()->cursorPaginate(7, ['*'], 'cursor', $cursor);

        // Agrega el resumen de reacciones a cada publicación,
        // indicando las reacciones del usuario autenticado.
        $posts->setCollection(
            $posts->getCollection()->map(function ($post) use ($auth_user) {
                $post->reactions = $post->reactionsSummary($auth_user->id);
                return $post;
            })
        );

        return Inertia::render('home/index', [
            'feed' => $feed,
            'posts' => PostResource::collection($posts),
        ]);
    }
}