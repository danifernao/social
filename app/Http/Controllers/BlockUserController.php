<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * Controlador responsable de gestionar el bloqueo de usuarios.
 * Permite que un usuario autenticado bloquee o desbloquee
 * a otro usuario, respetando ciertas restricciones:
 *   - Los moderadores no pueden bloquear ni ser bloqueados.
 *   - Un usuario no puede bloquearse a sí mismo.
 *   - No se puede bloquear a un usuario que ya te ha bloqueado.
 */
class BlockUserController extends Controller
{
    /**
     * Alterna el estado de bloqueo de un usuario por parte
     * del usuario autenticado.
     *
     * @param Request $request Datos de la petición HTTP.
     * @param User    $user    Instancia del usuario objetivo que
     *                         se bloqueará o desbloqueará.
     */
    public function toggle(Request $request, User $user)
    {
        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Los moderadores no pueden bloquear a otros usuarios.
        if ($auth_user->hasAnyRole(['admin', 'mod'])) {
            return back()->withErrors([
                'message' => __('Option disabled for moderators.'),
            ]);
        }

        // Un usuario no puede bloquearse a sí mismo.
        if ($auth_user->id === $user->id) {
            return back()->withErrors([
                'message' => __('Blocking yourself is not allowed.'),
            ]);
        }

        // Los usuarios que son moderadores no pueden ser bloqueados.
        if ($user->hasAnyRole(['admin', 'mod'])) {
            return back()->withErrors([
                'message' => __('Blocking a moderator is not allowed.'),
            ]);
        }

        // No se puede bloquear a un usuario que ya ha bloqueado
        // al usuario autenticado.
        if ($user->hasBlocked($auth_user)) {
            return back()->withErrors([
                'message' => __('Blocking a user who has already blocked you is not allowed.'),
            ]);
        }

        // Alterna el estado de bloqueo del usuario objetivo.
        $auth_user->toggleBlock($user);

        return back()->with('status', 'block_toggled');
    }
}