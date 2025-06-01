<?php

namespace App\Http\Controllers\Content;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class BlockUserController extends Controller
{
   /**
     * Alterna el bloqueo de un usuario por parte del usuario autenticado.
     *
     * @param Request $request
     * @param User $user Usuario a bloquear o desbloquear.
     */
    public function toggle(Request $request, User $user)
    {
        $auth_user = $request->user();

        // Evita que un usuario se bloquee a sí mismo.
        if (!$auth_user->toggleBlock($user)) {
            return back()->withErrors(['message' => 'No puedes bloquearte a ti mismo.']);
        }

        return back();
    }
}