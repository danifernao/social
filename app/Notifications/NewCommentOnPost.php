<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Notificación enviada cuando un usuario comenta en una publicación ajena.
 */
class NewCommentOnPost extends Notification
{
    use Queueable;

    /**
     * Crea una nueva instancia de la notificación.
     *
     * @param User $sender        Usuario que realizó el comentario.
     * @param int  $postId        ID de la publicación comentada.
     * @param int  $postAuthorId  ID del autor de la publicación.
     */
    public function __construct(
        public User $sender,
        public int $postId,
        public int $postAuthorId
    ) {}

    /**
     * Define los canales por los que se enviará la notificación.
     * En este caso, solo se almacena en la base de datos.
     *
     * @param object $notifiable  Usuario que recibirá la notificación.
     * @return array<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Define la estructura de la notificación al guardarse en la base de datos.
     *
     * @param object $notifiable  Usuario que recibirá la notificación.
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'comment', // Tipo de notificación.
            'data' => [
                'sender' => [ // Usuario que realizó el comentario.
                    'id' => $this->sender->id,
                    'username' => $this->sender->username,
                ],
                'context' => [ // Contexto donde ocurrió el comentario.
                    'type' => 'post',
                    'id' => $this->postId,
                    'author_id' => $this->postAuthorId,
                ],
            ],
        ];
    }
}