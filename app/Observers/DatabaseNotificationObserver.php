<?php

namespace App\Observers;

use App\Events\UnreadNotificationsCountUpdated;
use Illuminate\Notifications\DatabaseNotification;

/**
 * Observa eventos del modelo DatabaseNotification para reaccionar
 * a cambios relevantes en su estado.
 */
class DatabaseNotificationObserver
{
    /**
     * Método que se ejecuta cuando se crea una nueva notificación.
     */
    public function created(DatabaseNotification $notification): void
    {
        // Obtiene el usuario que recibe la notificación.
        $user = $notification->notifiable;

        // Emite un evento para informar que el conteo de notificaciones
        // no leídas del usuario ha cambiado.
        event(new UnreadNotificationsCountUpdated(
            $user->id,
            $user->unreadNotifications()->count()
        ));
    }

    /**
     * Método que se ejecuta cuando se actualiza una notificación.
     */
    public function updated(DatabaseNotification $notification): void
    {
        // Solo actúa si cambia el campo 'read_at' (lectura de la notificación).
        if ($notification->isDirty('read_at')) {
            // Obtiene el usuario que recibe la notificación.
            $user = $notification->notifiable;

            // Emite un evento para informar que el conteo de notificaciones
            // no leídas del usuario ha cambiado.
            event(new UnreadNotificationsCountUpdated(
                $user->id,
                $user->unreadNotifications()->count()
            ));
        }
    }
}