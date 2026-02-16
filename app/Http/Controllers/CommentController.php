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

/**
 * Controlador responsable de gestionar los comentarios en publicaciones.
 *
 * Permite crear, actualizar y eliminar comentarios, aplicando
 * las siguientes reglas:
 *   - Verifica bloqueos entre usuarios para permitir o denegar acciones.
 *   - Gestiona menciones dentro de los comentarios y envía notificaciones
 *     a los usuarios mencionados.
 *   - Notifica al autor de la publicación y a otros comentaristas
 *     según corresponda.
 */
class CommentController extends Controller
{
    /**
     * Inyecta el servicio MentionService para gestionar menciones
     * asociadas a comentarios y enviar notificaciones correspondientes.
     */
    public function __construct(
        protected MentionService $mentionService
    ) {}

    /**
     * Crea un nuevo comentario en una publicación.
     *
     * @param Request $request Datos de la petición HTTP.
     * @param Post    $post    Instancia de la publicación
     *                         en la que se va a comentar.
     */
    public function store(Request $request, Post $post)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos para crear un comentario.
        $this->authorize('create', Comment::class);

        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Si el autor de la publicación ha bloqueado al usuario autenticado,
        // se deniega la acción.
        if ($post->user->hasBlocked($auth_user)) {
            abort(403);
        }

        // Valida los datos enviados desde el formulario.
        $data = $request->validate([
            'content' => 'required|string|max:3000',
        ]);

        // Crea el comentario en la base de datos.
        $comment = Comment::create([
            'user_id' => $auth_user->id,
            'post_id' => $post->id,
            'content' => $data['content'],
        ]);

        // Relaciona el usuario autenticado con el comentario (solo en memoria).
        $comment->setRelation('user', $auth_user);

        // Detecta, registra y notifica las menciones
        // presentes en el comentario.
        $this->mentionService
            ->createWithNotifications($comment, $auth_user, 'comment');

        // Recupera los usuarios mencionados en el comentario.
        $mentioned_users = User::whereIn(
            'id',
            $comment->mentions()->pluck('user_id')
        )->get();

        // Lista de IDs de usuarios que ya han sido notificados.
        $notified_user_ids = $mentioned_users->pluck('id')->toArray();

        // Notifica al autor de la publicación si no es el mismo que el autor
        // del comentario y aún no ha sido mencionado.
        if ($post->user_id !== $auth_user->id
            && !in_array($post->user_id, $notified_user_ids)) {
            $post->user->notify(
                new NewCommentOnPost($auth_user, $post->id, $post->user_id)
            );
        }

        // Agrega el autor del comentario y el autor de la publicación
        // a la lista de usuarios notificados.
        $notified_user_ids[] = $auth_user->id;
        $notified_user_ids[] = $post->user_id;

        // Obtiene otros comentaristas de la publicación que aún
        // no han sido notificados.
        $other_commenters = $post->comments()
            ->whereNotIn('user_id', $notified_user_ids)
            ->pluck('user_id')
            ->unique();

        // Recupera los usuarios que deben ser notificados.
        $users_to_notify = User::whereIn('id', $other_commenters)->get();

        // Excluye usuarios que hayan bloqueado al autor del comentario
        // o que hayan sido bloqueados por él.
        $users_to_notify = $users_to_notify->reject(
            function ($user) use ($auth_user) {
                return $auth_user->hasBlocked($user)
                    || $user->hasBlocked($auth_user);
            }
        );

        // Notifica a los demás comentaristas sobre el nuevo comentario.
        $users_to_notify->each(function ($user) use ($auth_user, $post) {
            $user->notify(
                new NewCommentOnPost($auth_user, $post->id, $post->user_id)
            );
        });

        // Transforma el comentario utilizando CommentResource para el frontend.
        $comment_data = (new CommentResource($comment))->resolve();

        return back()->with('comment', $comment_data);
    }

    /**
     * Actualiza el contenido de un comentario existente.
     *
     * @param Request $request Datos de la petición HTTP.
     * @param Comment $comment Instancia del comentario que se va a actualizar.
     */
    public function update(Request $request, Comment $comment)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos para actualizar el comentario.
        $this->authorize('update', $comment);

        // Valida los datos enviados desde el formulario.
        $data = $request->validate([
            'content' => 'required|string|max:3000',
        ]);

        // Actualiza el contenido del comentario.
        $comment->content = $data['content'];
        $comment->save();

        // Carga la relación del autor del comentario y sus permisos.
        $comment->load('user');

        // Sincroniza las menciones presentes en el comentario.
        $this->mentionService->sync($comment, $request->user());

        // Transforma el comentario utilizando CommentResource para el frontend.
        $comment_data = (new CommentResource($comment))->resolve();
        
        return back()->with('comment',  $comment_data);
    }

    /**
     * Elimina un comentario existente.
     *
     * @param Comment $comment Instancia del comentario que se va a eliminar.
     */
    public function delete(Comment $comment)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos para eliminar el comentario.
        $this->authorize('delete', $comment);
        
        // Elimina el comentario de la base de datos.
        $comment->delete();

        return back()->with('status', 'comment_deleted');
    }
}