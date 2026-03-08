<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Gate;

/**
 * Notificación enviada cuando un usuario es mencionado en un contenido.
 */
class NewMention extends Notification
{
    use Queueable;

    /**
     * Crea una nueva instancia de la notificación.
     *
     * @param User  $sender Usuario que realizó la mención.
     * @param Model $model  Modelo de la publicación o comentario en donde
     *                      se realizó la mención.
     */
    public function __construct(
        public User $sender,
        public Model $model,
    ) {}

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
     * Determina si la notificación debe enviarse.
     *
     * @param object $notifiable Usuario que recibirá la notificación.
     * @param string $channel    Canal de notificación.
     * @return bool
     */
    public function shouldSend(object $notifiable, string $channel): bool
    {
        // Determina la publicación asociada al contenido.
        $post = $this->model instanceof Post
            ? $this->model
            : $this->model->post;

        // Si el usuario ha silenciado esta publicación,
        // no se debe enviar la notificación.
        if ($post->isMutedBy($notifiable)) {
            return false;
        }

        // Si el usuario no puede ver la publicación,
        // no se debe enviar la notificación.
        if (!Gate::forUser($notifiable)->allows('view', $post)) {
            return false;
        }

        // Si existe bloqueo entre quien menciona y quien sería notificado,
        // no se debe enviar la notificación.
        if ($notifiable->hasBlockedOrBeenBlockedBy($this->sender)) {
            return false;
        }

        return true;
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
            'type' => 'mention', // Tipo de notificación.
            'data' => [
                'sender' => [ // Usuario que realizó la mención.
                    'id'       => $this->sender->id,
                    'username' => $this->sender->username,
                ],
                'context' => [ // Contenido donde ocurrió la mención.
                    'type' => strtolower(class_basename($this->model)), // "post" o "comment".
                    'id'   => $this->model->id, // ID de publicación o comentario.
                ],
            ],
        ];
    }
}