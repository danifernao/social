<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class BlockUserController extends Controller
{
   /**
     * Alterna el bloqueo de un usuario por parte del usuario autenticado.
     *
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario a bloquear o desbloquear.
     */
    public function toggle(Request $request, User $user)
    {
        $auth_user = $request->user();

        // Los moderadores no pueden bloquear a nadie.
        if ($auth_user->canModerate()) {
            return back()->withErrors([
                'message' => __('Option disabled for moderators.'),
            ]);
        }

        // No puede bloquearse a sí mismo.
        if ($auth_user->id === $user->id) {
            return back()->withErrors([
                'message' => __('Blocking yourself is not allowed.'),
            ]);
        }

        // A los moderadores no se pueden bloquear.
        if ($user->canModerate()) {
            return back()->withErrors([
                'message' => __('Blocking a moderator is not allowed.'),
            ]);
        }

        // Si el usuario destino ya ha bloqueado al autenticado, no se puede bloquear.
        if ($user->hasBlocked($auth_user)) {
            return back()->withErrors([
                'message' => __('Blocking a user who has already blocked you is not allowed.'),
            ]);
        }

        // Alterna bloqueo.
        $auth_user->toggleBlock($user);

        return back()->with('status', 'block_toggled');
    }
}