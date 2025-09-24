<?php

namespace App\Http\Controllers\Social;

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
            return back()->withErrors(['message' => 'Opción desactivada para moderadores.']);
        }

        // No puede bloquearse a sí mismo.
        if ($auth_user->id === $user->id) {
            return back()->withErrors(['message' => 'No puedes bloquearte a ti mismo.']);
        }

        // A los moderadores no se pueden bloquear.
        if ($user->canModerate()) {
            return back()->withErrors(['message' => 'No puedes bloquear a un moderador.']);
        }

        // Si el usuario destino ya ha bloqueado al autenticado, no se puede bloquear.
        if ($user->hasBlocked($auth_user)) {
            return back()->withErrors(['message' => 'No puedes bloquear a un usuario que ya te ha bloqueado.']);
        }

        // Alterna bloqueo.
        $auth_user->toggleBlock($user);

        return back();
    }
}