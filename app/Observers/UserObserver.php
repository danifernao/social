<?php

namespace App\Observers;

use App\Models\Media;
use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Storage;

/**
 * Observa eventos del modelo User para manejar efectos secundarios
 * relacionados con su ciclo de vida.
 */
class UserObserver
{
    /**
     * Inyecta el servicio MediaService para gestionar los archivos
     * multimedia del usuario.
     */
    public function __construct(
        protected MediaService $mediaService
    ) {}

    /**
     * Método que se ejecuta antes de que usuario sea eliminado.
     */
    public function deleting(User $user): void
    {
        // Elimina los archivos subidos por el usuario.
        $this->mediaService->deleteAllFromUser($user->id);

        // Elimina todas las notificaciones generadas por el usuario.
        DatabaseNotification::where(
            'data->data->sender->id',
            $user->id
        )->delete();
    }
}