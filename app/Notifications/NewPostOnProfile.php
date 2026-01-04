<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Notificación enviada cuando un moderador publica en el perfil de un usuario.
 */
class NewPostOnProfile extends Notification
{
    use Queueable;

    /**
     * Crea una nueva instancia de la notificación.
     *
     * @param User $sender  Usuario que creó la publicación.
     * @param int  $postId  ID de la publicación creada.
     */
    public function __construct(
        public User $sender,
        public int $postId,
    ) {}

    /**
     * Define los canales por los que se enviará la notificación.
     * En este caso, solo se guarda en la base de datos.
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
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'post', // Tipo de notificación.
            'data' => [
                'sender' => [ // Usuario que creó la publicación.
                    'id' => $this->sender->id,
                    'username' => $this->sender->username,
                ],
                'context' => [ // Contexto de la publicación creada.
                    'type' => 'post',
                    'id' => $this->postId,
                ],
            ],
        ];
    }
}