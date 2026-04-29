import { Auth } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useState } from 'react';
import CounterBadge from '../shared/counter-badge';

/**
 * Badge con la cantidad de notificaciones no leídas del usuario autenticado.
 */
export default function NotificationBadge() {
    const { auth, unreadNotisCount } = usePage<{ auth: Auth; unreadNotisCount: number }>().props;

    // Si no existe un usuario autenticado, el componente no renderiza nada.
    if (!auth.user) return null;

    return <NotificationBadgeListener userId={auth.user.id} initialCount={unreadNotisCount} />;
}

/**
 * Componente encargado de escuchar actualizaciones
 * en tiempo real sobre notificaciones no leídas.
 */
function NotificationBadgeListener({ userId, initialCount }: { userId: number; initialCount: number }) {
    // Estado local que almacena la cantidad actual de notificaciones no leídas.
    const [unreadCount, setUnreadCount] = useState<number>(initialCount);

    // Se suscribe al canal privado de notificaciones del usuario autenticado.
    // Escucha el evento que informa cambios en el número de notificaciones no leídas
    // y actualiza el estado local para reflejarlo en tiempo real en la interfaz.
    useEcho(`notifications.${userId}`, ['.UnreadNotificationsCountUpdated'], (event: { user_id: number; unread_count: number }) => {
        setUnreadCount(event.unread_count);
    });

    // Si el usuario no tiene notificaciones pendientes, el badge no se muestra.
    if (unreadCount <= 0) return null;

    return <CounterBadge count={unreadCount} />;
}
