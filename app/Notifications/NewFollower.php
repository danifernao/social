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
     * @param User $follower Usuario que inició el seguimiento.
     */
    public function __construct(public User $follower){}

    /**
     * Define los canales por los que se enviará la notificación.
     * En este caso, solo se almacena en la base de datos.
     *
     * @param object $notifiable Usuario que recibirá la notificación.
     * @return array<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Define la estructura de la notificación al guardarse en la base de datos.
     *
     * @param object $notifiable Usuario que recibirá la notificación.
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'follow', // Tipo de notificación.
            'data' => [
                'sender' => [ // Usuario que inició el seguimiento.
                    'id' => $this->follower->id,
                    'username' => $this->follower->username,
                ],
            ],
        ];
    }
}