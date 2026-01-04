<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Notificación enviada cuando un usuario es mencionado en un contenido.
 */
class NewMention extends Notification
{
    use Queueable;

    /**
     * Crea una nueva instancia de la notificación.
     *
     * @param User $sender          Usuario que realizó la mención.
     * @param string $contextType   Tipo de contenido donde ocurrió la mención.
     * @param int $contextId        ID del contenido mencionado.
     */
    public function __construct(
        public User $sender,
        public string $contextType,
        public int $contextId
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
                    'id' => $this->sender->id,
                    'username' => $this->sender->username,
                ],
                'context' => [ // Contenido donde ocurrió la mención.
                    'type' => $this->contextType, // "post" o "comment".
                    'id' => $this->contextId, // ID de publicación o comentario.
                ],
            ],
        ];
    }
}