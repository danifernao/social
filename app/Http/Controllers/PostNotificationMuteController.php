<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

/**
 * Controlador encargado de gestionar el silenciamiento de
 * notificaciones asociadas a publicaciones.
 */
class PostNotificationMuteController extends Controller
{
    use AuthorizesRequests;

    /**
     * Silencia o deja de silenciar una publicación.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Post    $post    Instancia de la publicación que se va a
     *                         silenciar o dejar de silenciar.
     */
    public function toggle(Request $request, Post $post) {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos para ver la publicación.
        $this->authorize('view', $post);

        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Verifica si el usuario ya ha silenciado la publicación.
        $isMuted = $post->mutedUsers()
            ->where('user_id', $auth_user->id)
            ->exists();

        // Silencia o deja de silenciar la publicación.
        if ($isMuted) {
            $post->mutedUsers()->detach($auth_user->id);
            $muted = false;
        } else {
            $post->mutedUsers()->attach($auth_user->id);
            $muted = true;
        }

        $status = $muted ? 'post_muted' : 'post_unmuted';

        $message = $muted
            ? __('Notifications for this post have been muted.')
            : __('Notifications for this post have been enabled.');            

        return back()->with([
            'status' => $status,
            'message' => $message,
        ]);
    }
}