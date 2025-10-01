<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewPostOnProfile extends Notification
{
    use Queueable;

    /**
     * Crea una nueva instancia de la notificación.
     *
     * @param User $sender  El moderador que creó la publicación.
     * @param int  $postId  El ID de la publicación creada.
     */
    public function __construct(
        public User $sender,
        public int $postId,
    ) {}

    /**
     * Define los canales por los que se enviará la notificación.
     * En este caso, solo se guarda en la base de datos.
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
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'post', // Tipo de notificación para frontend.
            'data' => [
                'sender' => [ // Moderador que creó la publicación.
                    'id' => $this->sender->id,
                    'username' => $this->sender->username,
                ],
                'context' => [ // Contexto: la publicación.
                    'type' => 'post',
                    'id' => $this->postId,
                ],
            ],
        ];
    }
}