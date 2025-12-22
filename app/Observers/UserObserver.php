<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Storage;

class UserObserver
{
    /**
     * Método que se ejecuta antes de que usuario sea eliminado.
     */
    public function deleting(User $user): void
    {
        // Elimina el avatar del usuario si existe.
        if (
            $user->avatar_path
            && Storage::disk('public')->exists($user->avatar_path)
        ) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        // Elimina todas las notificaciones generadas por el usuario.
        DatabaseNotification::where(
            'data->data->sender->id',
            $user->id
        )->delete();
    }
}