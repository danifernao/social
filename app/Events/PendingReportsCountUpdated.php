<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento que se emite cuando cambia la cantidad de reportes pendientes
 * de moderación.
 */
class PendingReportsCountUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Crea una nueva instancia del evento.
     *
     * @param int $pending_count Cantidad de reportes pendientes.
     */
    public function __construct(
        public int $pending_count
    ) {}

    /**
     * Define los canales privados donde se transmitirá el evento.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('reports'),
        ];
    }

    /**
     * Nombre personalizado del evento que se usará en el cliente.
     */
    public function broadcastAs(): string
    {
        return 'PendingReportsCountUpdated';
    }
}