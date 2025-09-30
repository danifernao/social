<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\User;
use App\Services\HashtagService;
use App\Services\MentionService;
use App\Utils\MentionParser;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class PostController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected HashtagService $hashtagService,
        protected MentionService $mentionService
    ) {}

    /**
     * Crea una nueva publicación.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function create(Request $request)
    {
        $data = $request->validate([
            'content' => 'required|string|max:3000'
        ]);

        $auth_user = $request->user();

        // Crea la publicación.
        $post = Post::create([
            'user_id' => $auth_user->id,
            'content' => $data['content'],
        ]);

        // Agrega el usuario autenticado a la publicación.
        $post->setRelation('user', $auth_user);

        // Registra las etiquetas usadas en la publicación.
        $this->hashtagService->sync($post);

        // Guarda menciones y envía notificaciones.
        $this->mentionService->createWithNotifications($post, $auth_user, 'post');

        // Prepara el recurso y lo convierte en un arreglo.
        $post_data = (new PostResource($post))->resolve();

        return back()->with('post', $post_data);
    }

    /**
     * Muestra una publicación específica con sus comentarios.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Post $post Publicación que se va a mostrar.
     */
    public function show(Request $request, Post $post)
    {
        $user = $request->user();

        // Si está autenticado, verifica bloqueos mutuos.
        if ($user) {
            $author = $post->user()->first();
            if ($user->hasBlockedOrBeenBlockedBy($author)) {
                abort(403); // No puede ver la publicación.
            }
        }

        // Carga relaciones y reacciones.
        $post->load('user')->loadCount('comments');
        $post->reactions = $post->reactionsSummary($user?->id);

        $cursor = $request->header('X-Cursor');

        // Consulta de comentarios.
        $comments_query = $post->comments()->with('user')->oldest();

        // Excluye comentarios de usuarios con bloqueos mutuos.
        if ($user) {
            $excluded_ids = $user->excludedUserIds();
            $comments_query->whereNotIn('user_id', $excluded_ids);
        }

        $comments = $comments_query->cursorPaginate(15, ['*'], 'cursor', $cursor);

        // Agrega las reacciones a cada comentario.
        $comments->setCollection(
            $comments->getCollection()->map(function ($comment) use ($user) {
                $comment->reactions = $comment->reactionsSummary($user?->id);
                return $comment;
            })
        );

        return Inertia::render('post/index', [
            'post' => (new PostResource($post))->resolve(),
            'comments' => CommentResource::collection($comments),
        ]);
    }

    /**
     * Actualiza una publicación existente.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Post $post Publicación que se va a actualizar.
     */
    public function update(Request $request, Post $post)
    {
        $this->authorize('update', $post);

        $request->validate([
            'content' => 'required|string|max:3000',
        ]);

        $post->content = $request->content;
        $post->save();

        $post->load('user');

        // Actualiza las etiquetas usadas en la publicación.
        $this->hashtagService->sync($post);

        // Actualiza las menciones hechas en la publicación.
        $this->mentionService->sync($post, $request->user());

        // Prepara el recurso y lo convierte en un arreglo.
        $post_data = (new PostResource($post))->resolve();

        return back()->with('post', $post_data);
    }

    /**
     * Elimina una publicación.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Post $post Publicación que se va a eliminar.
     */
    public function delete(Request $request, Post $post)
    {
        $this->authorize('delete', $post);

        $post->delete();

        // Elimina las etiquetas usadas en la publicación.
        $this->hashtagService->detachAndClean($post);

        $referer = $request->header('referer');

        // Si el usuario estaba viendo la publicación eliminada, redirige al perfil.
        if ($referer && str_contains($referer, "/post/{$post->id}")) {
            return redirect()->route('profile.show', $post->user->username);
        }

        return back()->with('status', 'post_deleted');
    }
}