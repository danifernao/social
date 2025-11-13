<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $auth_user = $request->user();
        $cursor = $request->header('X-Cursor');

        // Construye la consulta base con el autor de cada publicación
        // y el conteo de comentarios.
        $query = Post::with('user')->withCount('comments');

        // Si el usuario autenticado no es moderador, limita el feed a
        // sus publicaciones y a las de los usuarios que sigue.
        if (!$auth_user->canModerate()) {
            $following_ids = $auth_user->followedUserIds();
            $following_ids[] = $auth_user->id;
            
            $query->whereIn('user_id', $following_ids);
        }

        // Obtiene las publicaciones.
        $posts = $query->latest()
            ->cursorPaginate(7, ['*'], 'cursor', $cursor);

        // Agrega las reacciones a cada publicación.
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