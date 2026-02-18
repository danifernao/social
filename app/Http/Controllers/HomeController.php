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

        // Construye la consulta base, incluyendo el autor de cada publicación
        // y el conteo de comentarios.
        $query = Post::with(['user', 'profileOwner'])->withCount('comments');

        // Si el usuario no es moderador, limita el feed a sus publicaciones
        // y a las de los usuarios que sigue.
        if (!$auth_user->hasAnyRole(['admin', 'mod'])) {
            $following_ids = $auth_user->followedUserIds();
            $following_ids[] = $auth_user->id;

            $query->where(function ($q) use ($following_ids, $auth_user) {
                // Publicaciones de los seguidos.
                $q->whereIn('user_id', $following_ids)
                  ->whereNull('profile_user_id');

                // Publicaciones de otros en el perfil
                // del usuario autenticado.
                $q->orWhere('profile_user_id', $auth_user->id);

                // Publicaciones del usuario autenticado hechas
                // en otros perfiles.
                $q->orWhere(function ($sub) use ($auth_user) {
                    $sub->where('user_id', $auth_user->id)
                        ->whereNotNull('profile_user_id');
                });
            });
        }

        // Obtiene las publicaciones ordenadas por fecha de creación
        // y paginadas mediante cursor.
        $posts = $query->latest()
            ->cursorPaginate(7, ['*'], 'cursor', $cursor);

        // Agrega el resumen de reacciones a cada publicación,
        // indicando las reacciones del usuario autenticado.
        $posts->setCollection(
            $posts->getCollection()->map(function ($post) use ($auth_user) {
                $post->reactions = $post->reactionsSummary($auth_user->id);
                return $post;
            })
        );

        return Inertia::render('home/index', [
            'posts' => PostResource::collection($posts),
        ]);
    }
}