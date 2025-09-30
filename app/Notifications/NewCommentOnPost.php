<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Notificación enviada cuando un usuario comenta en una publicación de otro usuario.
 */
class NewCommentOnPost extends Notification
{
    use Queueable;

    /**
     * Crea una nueva instancia de la notificación.
     *
     * @param User $sender  El usuario que escribió el comentario.
     * @param int  $postId  El ID de la publicación comentada.
     */
    public function __construct(
        public User $sender,
        public int $postId,
        public int $postAuthorId
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
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'comment', // Tipo de notificación (útil para el frontend).
            'data' => [
                'sender' => [ // Usuario que hizo el comentario.
                    'id' => $this->sender->id,
                    'username' => $this->sender->username,
                ],
                'context' => [ // Contexto: en qué publicación ocurrió.
                    'type' => 'post',
                    'id' => $this->postId,
                    'author_id' => $this->postAuthorId,
                ],
            ],
        ];
    }
}
