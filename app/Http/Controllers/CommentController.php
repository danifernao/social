<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Notifications\NewCommentOnPost;
use App\Services\MentionService;
use App\Utils\MentionParser;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    // Inyecta el servicio MentionService para gestionar
    // las menciones asociadas a comentarios.
    public function __construct(
        protected MentionService $mentionService
    ) {}

    /**
     * Crea un nuevo comentario en una publicación.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Post $post Publicación en la que se va a comentar.
     */
    public function store(Request $request, Post $post)
    {
        $auth_user = $request->user();

        // Si el autor de la publicación ha bloqueado al usuario autenticado,
        // no puede comentar.
        if ($post->user->hasBlocked($auth_user)) {
            abort(403);
        }

        $data = $request->validate([
            'content' => 'required|string|max:3000',
        ]);

        // Crea el comentario.
        $comment = Comment::create([
            'user_id' => $auth_user->id,
            'post_id' => $post->id,
            'content' => $data['content'],
        ]);

        // Relaciona el usuario autenticado con el comentario (solo en memoria).
        $comment->setRelation('user', $auth_user);

        // Guarda menciones y envía notificaciones.
        $this->mentionService
            ->createWithNotifications($comment, $auth_user, 'comment');

        // Recupera los usuarios mencionados en el comentario.
        $mentioned_users = User::whereIn(
            'id',
            $comment->mentions()->pluck('user_id')
        )->get();

        // Prepara una lista de usuarios que ya han sido notificados
        // para evitar redundancia.
        $notified_user_ids = $mentioned_users->pluck('id')->toArray();

        // Si el autor del comentario no es el mismo que el autor de la
        // publicación y este último no ha sido mencionado, se le notifica.
        if ($post->user_id !== $auth_user->id
            && !in_array($post->user_id, $notified_user_ids)) {
            $post->user->notify(
                new NewCommentOnPost($auth_user, $post->id, $post->user_id)
            );
        }

        // Se agrega el autor del comentario a la lista de usuarios notificados.
        $notified_user_ids[] = $auth_user->id;

        // Se agrega el autor de la publicación a la lista
        // de usuarios notificados.
        $notified_user_ids[] = $post->user_id;

        // Se buscan otros comentaristas de la publicación que
        // aún no han sido notificados.
        $other_commenters = $post->comments()
            ->whereNotIn('user_id', $notified_user_ids)
            ->pluck('user_id')
            ->unique();

        // Se obtienen los usuarios que deben ser notificados.
        $users_to_notify = User::whereIn('id', $other_commenters)->get();

        // Se excluyen los usuarios que hayan bloqueado al autor del comentario
        // o que hayan sido bloqueados por él.
        $users_to_notify = $users_to_notify->reject(
            function ($user) use ($auth_user) {
                return $auth_user->hasBlocked($user)
                    || $user->hasBlocked($auth_user);
            }
        );

        // Se notifica a los demás comentaristas que se ha publicado
        // un nuevo comentario.
        $users_to_notify->each(function ($user) use ($auth_user, $post) {
            $user->notify(
                new NewCommentOnPost($auth_user, $post->id, $post->user_id)
            );
        });

        // Genera el arreglo final del comentario aplicando la transformación
        // definida en CommentResource.
        $comment_data = (new CommentResource($comment))->resolve();

        return back()->with('comment', $comment_data);
    }

    /**
     * Actualiza un comentario.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Comment $comment Comentario que se va a actualizar.
     */
    public function update(Request $request, Comment $comment)
    {
        // Deniega acceso si el usuario no está autorizado para
        // actualizar el comentario.
        $this->authorize('update', $comment);

        $data = $request->validate([
            'content' => 'required|string|max:3000',
        ]);

        // Actualiza el contenido del comentario.
        $comment->content = $data['content'];
        $comment->save();

        // Carga el autor del comentario.
        $comment->load('user');

        // Sincroniza las menciones realizadas en el comentario.
        $this->mentionService->sync($comment, $request->user());

        // Genera el arreglo final del comentario aplicando la transformación
        // definida en CommentResource.
        $comment_data = (new CommentResource($comment))->resolve();
        
        return back()->with('comment',  $comment_data);
    }

    /**
     * Elimina un comentario.
     * 
     * @param Comment $comment Comentario que se va a eliminar.
     */
    public function delete(Comment $comment)
    {
        // Deniega acceso si el usuario no está autorizado para
        // eliminar el comentario.
        $this->authorize('delete', $comment);
        
        // Elimina el comentario.
        $comment->delete();

        return back()->with('status', 'comment_deleted');
    }
}