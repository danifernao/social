import { Auth } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useState } from 'react';
import CounterBadge from './counter-badge';

/**
 * Badge con la cantidad de notificaciones no leídas del usuario autenticado.
 */
export default function NotificationBadge() {
    // Captura el usuario autenticado y la cantidad inicial de notificaciones no leídas.
    const { auth, unreadNotisCount } = usePage<{ auth: Auth; unreadNotisCount: number }>().props;

    // Estado local que almacena la cantidad actual de notificaciones no leídas.
    const [unreadCount, setUnreadCount] = useState<number>(unreadNotisCount);

    // Si no existe un usuario autenticado, el componente no renderiza nada.
    if (!auth.user) return null;

    // Se suscribe al canal privado de notificaciones del usuario autenticado.
    // Escucha el evento que informa cambios en el número de notificaciones no leídas
    // y actualiza el estado local para reflejarlo en tiempo real en la interfaz.
    useEcho(`notifications.${auth.user.id}`, ['.UnreadNotificationsCountUpdated'], (event: { user_id: number; unread_count: number }) => {
        setUnreadCount(event.unread_count);
    });

    // Si el usuario no tiene notificaciones pendientes, el badge no se muestra.
    if (unreadCount <= 0) return null;

    return <CounterBadge count={unreadCount} />;
}
