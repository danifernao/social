import { Auth } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useState } from 'react';

/**
 * Muestra el contador de notificaciones no leídas.
 */
export default function NotificationBadge() {
    return null;

    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth, unreadNotisCount, routeName } = usePage<{ auth: Auth; unreadNotisCount: number; routeName: string }>().props;

    // Estado local para guardar la cantidad de notificaciones no leídas.
    const [unreadCount, setUnreadCount] = useState<number>(unreadNotisCount);

    // Si el usuario no está autenticado, no muestra nada.
    if (!auth.user) return null;

    // Escucha cambios en el contador de notificaciones no leídas.
    useEcho(`notifications.${auth.user.id}`, ['.UnreadNotificationsCountUpdated'], (event: { user_id: number; unread_count: number }) => {
        setUnreadCount(event.unread_count);
    });

    // Fuerza recarga de unreadNotisCount cuando se entra a la página Notificaciones.
    useEffect(() => {
        if (routeName === 'notification.show') {
            router.reload({
                only: ['unreadNotisCount'],
            });
        }
    }, [routeName]);

    // Si no hay notificaciones no leídas, no muestra nada.
    if (unreadCount <= 0) return null;

    return <div className="ml-auto rounded-sm bg-red-600 p-px px-1 text-xs font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</div>;
}
