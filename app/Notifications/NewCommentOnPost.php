<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Gate;

/**
 * Notificación enviada cuando un usuario comenta en una publicación ajena.
 */
class NewCommentOnPost extends Notification
{
    use Queueable;

    /**
     * Crea una nueva instancia de la notificación.
     *
     * @param User $sender         Usuario que realizó el comentario.
     * @param Post $post           Publicación comentada.
     */
    public function __construct(
        public User $sender,
        public Post $post,
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
     * Determina si la notificación debe enviarse.
     *
     * @param object $notifiable Usuario que recibirá la notificación.
     * @param string $channel    Canal de notificación.
     * @return bool
     */
    public function shouldSend(object $notifiable, string $channel): bool
    {
        // Si el usuario ha silenciado esta publicación,
        // no se debe enviar la notificación.
        if ($this->post->isMutedBy($notifiable)) {
            return false;
        }

        // Si el usuario no puede ver la publicación,
        // no se debe enviar la notificación.
        if (!Gate::forUser($notifiable)->allows('view', $this->post)) {
            return false;
        }

        // Si existe bloqueo entre quien comenta y quien sería notificado,
        // no se debe enviar la notificación.
        if ($notifiable->hasBlockedOrBeenBlockedBy($this->sender)) {
            return false;
        }

        return true;
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
                    'id'       => $this->sender->id,
                    'username' => $this->sender->username,
                ],
                'context' => [ // Contexto donde ocurrió el comentario.
                    'type'      => 'post',
                    'id'        => $this->post->id,
                    'author_id' => $this->post->user_id,
                ],
            ],
        ];
    }
}