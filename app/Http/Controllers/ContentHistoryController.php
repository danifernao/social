<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;
use App\Http\Resources\ContentHistoryResource;
use App\Http\Resources\PostResource;
use App\Models\Comment;
use App\Models\ContentHistory;
use App\Models\Post;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controlador responsable de mostrar el historial
 * de cambios de publicaciones y comentarios.
 */
class ContentHistoryController extends Controller
{
    use AuthorizesRequests;

    /**
     * Muestra el historial de cambios de una publicación o comentario.
     * 
     * @param Request      $request Datos de la petición HTTP.
     * @param Post         $post    Publicación que se desea consultar.
     * @param Comment|null $comment Comentario que se desea consultar.
     */
    public function index(Request $request, Post $post, Comment $comment = null)
    {
        // Si se indicó un comentario, valida que pertenezca
        // a la publicación indicada en la URL.
        if ($comment && $comment->post_id !== $post->id) {
            abort(404);
        }

        // Obtiene el cursor para la paginación.
        $cursor = $request->header('X-Cursor');

        // Determina el modelo cuyo historial se va a consultar.
        $model = $comment ?? $post;

        // Obtiene el historial de cambios.
        $histories = ContentHistory::with('user')
            ->where('historable_type', $model::class)
            ->where('historable_id', $model->id)
            ->oldest()
            ->cursorPaginate(7, ['*'], 'cursor', $cursor);

        // Carga el autor de la publicación.
        $post->load('user');

        // Transforma la publicación para el frontend.
        $post_data = (new PostResource($post->load('user')))->resolve();

        // Transforma el comentario para el frontend.
        $comment_data = $comment ? (new CommentResource($comment))->resolve() : null;

        return Inertia::render('history/index', [
            'post' => $post_data,
            'comment' => $comment_data,
            'histories' => ContentHistoryResource::collection($histories),
        ]);
    }
}
