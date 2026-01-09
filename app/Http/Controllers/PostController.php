<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Http\Resources\PostResource;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Notifications\NewPostOnProfile;
use App\Services\HashtagService;
use App\Services\MentionService;
use App\Utils\MentionParser;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Pagination\CursorPaginator;
use Inertia\Inertia;

/**
 * Controlador responsable de la gestión de publicaciones.
 *
 * Proporciona funcionalidades para:
 *   - Crear publicaciones en el perfil propio o de otros (si tiene permisos).
 *   - Mostrar publicaciones individuales con sus comentarios y reacciones.
 *   - Actualizar contenido de publicaciones existentes.
 *   - Eliminar publicaciones, junto con sus etiquetas y relaciones asociadas.
 */
class PostController extends Controller
{
    use AuthorizesRequests;

    /**
     * Inyecta los servicios HashtagService y MentionService
     * para gestionar etiquetas y menciones presentes en una publicación.
     */
    public function __construct(
        protected HashtagService $hashtagService,
        protected MentionService $mentionService
    ) {}

    /**
     * Crea una nueva publicación.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function store(Request $request)
    {
        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Valida los datos enviados desde el formulario.
        $data = $request->validate([
            'content' => 'required|string|max:3000',
            'profile_user_id' => 'nullable|integer|exists:users,id',
        ]);
        
        // ID del perfil donde se hará la publicación (si aplica).
        // Por defecto, se asocia al perfil del usuario autenticado (user_id).
        // profile_user_id solo cambia cuando el usuario autenticado
        // publica en el perfil de otra persona.
        $profile_user_id = null;

        // Permite publicar en el perfil de otro usuario solo si:
        // - Se envió un profile_user_id válido.
        // - No es el mismo usuario autenticado.
        // - El usuario autenticado tiene permisos de moderación.
        if (!empty($data['profile_user_id']) &&
            $data['profile_user_id'] !== $auth_user->id &&
            $auth_user->canModerate()) {
                $profile_user_id = $data['profile_user_id'];
        }

        // Crea la publicación en la base de datos.
        $post = Post::create([
            'user_id' => $auth_user->id,
            'content' => $data['content'],
            'profile_user_id' => $profile_user_id,
        ]);

        // Notifica al propietario del perfil si se publicó en un perfil ajeno.
        if ($profile_user_id) {
            $profileUser = User::find($profile_user_id);
            if ($profileUser) {
                $profileUser->notify(
                    new NewPostOnProfile($auth_user, $post->id)
                );
            }
        }

        // Relaciona el usuario autenticado con la publicación
        // (solo en memoria).
        $post->setRelation('user', $auth_user);

        // Registra las etiquetas presentes en la publicación.
        $this->hashtagService->sync($post);

        // Detecta, registra y notifica las menciones presentes
        // en la publicación.
        $this->mentionService
            ->createWithNotifications($post, $auth_user, 'post');

        // Transforma la publicación utilizando UserResource para el frontend.
        $post_data = (new PostResource($post))->resolve();

        return back()->with('post', $post_data);
    }

    /**
     * Muestra una publicación específica junto con sus comentarios.
     * 
     * @param Request      $request Datos de la petición HTTP.
     * @param Post         $post    Instancia de la publicación
     *                              que se va a mostrar.
     * @param Comment|null $comment Instancia del omentario específico
     *                              que se va a mostrar (opcional).
     */
    public function show(Request $request, Post $post, Comment $comment = null)
    {
        // Obtiene el usuario autenticado.
        $user = $request->user();

        // Verifica que no exista bloqueo mutuo entre el usuario autenticado
        // y el autor de la publicación.
        if ($user) {
            $author = $post->user()->first();
            if ($user->hasBlockedOrBeenBlockedBy($author)) {
                abort(403);
            }
        }

        // Si se indicó un comentario específico,
        // valida que pertenezca a la publicación.
        if ($comment && $comment->post_id !== $post->id) {
            abort(404);
        }

        // Carga el autor y la cantidad total de comentarios.
        $post->load('user')->loadCount('comments');

        // Obtiene las reacciones de la publicación.
        $post->reactions = $post->reactionsSummary($user?->id);

        // Captura el cursor para la paginación de comentarios.
        $cursor = $request->header('X-Cursor');

        // Cantidad de comentarios por página.
        $per_page = 15;

        // Consulta base de comentarios, ordenados de forma ascendente.
        $comments_query = $post->comments()->with('user')->oldest();

        // Excluye comentarios de usuarios con bloqueos mutuos.
        if ($user) {
            $excluded_ids = $user->excludedUserIds();
            $comments_query->whereNotIn('user_id', $excluded_ids);
        }

        // Si se solicita un comentario específico,
        // se crea una paginación manual.
        if ($comment) {
            $comment->load('user');
            $comments = new CursorPaginator([$comment], $per_page, null, [
                'path' => $request->url(),
                'cursorName' => 'cursor',
            ]);
        } else {
            // Obtiene los comentarios paginados por cursor.
            $comments = $comments_query
                ->cursorPaginate($per_page, ['*'], 'cursor', $cursor);
        }

        // Agrega el resumen de reacciones a cada comentario.
        $comments->setCollection(
            $comments->getCollection()->map(function ($comment) use ($user) {
                $comment->reactions = $comment->reactionsSummary($user?->id);
                return $comment;
            })
        );

        // Transforma la publicación utilizando PostResource para el frontend.
        $post_data = (new PostResource($post))->resolve();

        return Inertia::render('post/show', [
            'post' => $post_data,
            'comments' => CommentResource::collection($comments),
        ]);
    }

    /**
     * Actualiza una publicación existente.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Post    $post    Instancia de la publicación
     *                         que se va a actualizar.
     */
    public function update(Request $request, Post $post)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos para actualizar la publicación.
        $this->authorize('update', $post);

        // Valida los datos enviados desde el formulario.
        $request->validate([
            'content' => 'required|string|max:3000',
        ]);

        // Actualiza el contenido de la publicación.
        $post->content = $request->content;
        $post->save();

        // Carga la relación con el usuario autor.
        $post->load('user');

        // Actualiza las etiquetasy menciones presentes en la publicación.
        $this->hashtagService->sync($post);
        $this->mentionService->sync($post, $request->user());

        // Transforma la publicación utilizando PostResource para el frontend.
        $post_data = (new PostResource($post))->resolve();

        return back()->with('post', $post_data);
    }

    /**
     * Elimina una publicación.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Post    $post    Instancia de la publicación que se va a eliminar.
     */
    public function delete(Request $request, Post $post)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos para eliminar la publicación.
        $this->authorize('delete', $post);

        // Elimina la publicación.
        $post->delete();

        // Elimina etiquetas asociadas y limpia las que queden sin uso.
        $this->hashtagService->detachAndClean($post);

        // Obtiene la URL de la página desde la cual se hizo la petición.
        $referer = $request->header('referer');

        // Si el usuario estaba en la página de la publicación eliminada,
        // redirige al perfil del autor.
        if ($referer && str_contains($referer, "/post/{$post->id}")) {
            return redirect()->route('profile.show', $post->user->username);
        }

        return back()->with('status', 'post_deleted');
    }
}