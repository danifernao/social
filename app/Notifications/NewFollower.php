<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Notificación enviada cuando un usuario comienza a seguir a otro.
 */
class NewFollower extends Notification
{
    use Queueable;

    /**
     * Crea una nueva instancia de la notificación.
     *
     * @param User $follower El seguidor.
     */
    public function __construct(public User $follower){}

    /**
     * Define los canales por los que se enviará la notificación.
     *
     * @param object $notifiable El usuario que recibirá la notificación.
     * @return array<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Define la estructura de la notificación al almacenarla en la base de datos.
     *
     * @param object $notifiable El usuario que recibirá la notificación.
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'follow', // Tipo de notificación (útil para el frontend).
            'data' => [
                'sender' => [ // Usuario que comenzó a seguir.
                    'id' => $this->follower->id,
                    'username' => $this->follower->username,
                ],
            ],
        ];
    }
}
