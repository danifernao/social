<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UnreadNotificationsCountUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

/**
     * Crea una nueva instancia del evento.
     *
     * @param int $user_id ID del usuario que recibe la notificación.
     * @param int $unread_count Cantidad de notificaciones no leídas.
     */
    public function __construct(
        public int $user_id,
        public int $unread_count
    ){}

    /**
     * Define los canales privados donde se transmitirá el evento.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.' . $this->user_id),
        ];
    }

    /**
     * Nombre personalizado del evento que se usará en el cliente.
     */
    public function broadcastAs(): string
    {
        return 'UnreadNotificationsCountUpdated';
    }
}