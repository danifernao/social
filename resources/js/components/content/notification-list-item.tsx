import type { Notification } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useRef } from 'react';

interface NotificationListItemProps {
    notification: Notification;
}

/**
 * Muestra una notificación y la marca como leída al hacer clic en ella.
 */
export default function NotificationListItem({ notification }: NotificationListItemProps) {
    // Accede al token CSRF proporcionado por Inertia.
    // Este token es necesario para que Laravel acepte la solicitud PATCH.
    const { csrfToken } = usePage<{ csrfToken: string }>().props;

    // Referencia del elemento HTML que contiene la notificaión.
    // Esta referencia se usará con IntersectionObserver para detectar cuándo está visible.
    const notificationRef = useRef<HTMLLIElement | null>(null);

    // Determina si la notificación ha sido marcada como leída o no.
    // Evita que el IntersectionObserver dispare múltiples peticiones si se activa más de una vez.
    const isMarkedAsRead = useRef(false);

    // Tipo de notificación.
    const type = notification.data.type;

    // Usuario que generó la notificación (remitente).
    const sender = notification.data.data.sender;

    // Fuente de la notificación. Puede ser una publicación o un comentario.
    const context = notification.data.data.context;

    // URL de destino de la notificación.
    const url = context ? `/post/${context.id}` : `/user/${sender.username}`;

    // Fecha de creación de la notificación en formato corto y legible.
    const formattedDate = format(parseISO(notification.created_at), 'dd/MM/yyyy h:mm a');

    // Tiempo relativo en español desde que se creó la notificación.
    const distanceToNow = formatDistanceToNow(new Date(notification.created_at), {
        addSuffix: true,
        locale: es,
    });

    // Marca la notificación como leída si no lo está.
    useEffect(() => {
        if (notification.read_at || !notificationRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isMarkedAsRead.current) {
                    isMarkedAsRead.current = true;

                    // Se hace una petición PATCH para marcar como leída.
                    fetch(route('notification.markOneAsRead', { id: notification.id }), {
                        method: 'PATCH',
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                            Accept: 'application/json',
                        },
                    });
                }
            },
            {
                threshold: 0.5, // Se considera "visible" si al menos el 50% está en pantalla.
            },
        );

        observer.observe(notificationRef.current);

        return () => observer.disconnect();
    }, [notification]);

    return (
        <li ref={notificationRef} className={`flex flex-col border-b px-4 py-4 last:border-b-0 ${notification.read_at ? 'text-gray-500' : ''}`}>
            <Link href={url}>
                <span className="font-bold">{sender.username}</span>
                {type === 'follow' && ' te ha seguido.'}
                {type === 'comment' && ' ha comentado en una publicación tuya.'}
                {type === 'mention' && ' te ha mencionado en'}
                {type === 'mention' && context && context.type === 'post' && ' una publicación.'}
                {type === 'mention' && context && context.type === 'comment' && ' un comentario.'}
            </Link>
            <time className="text-sm" dateTime={notification.created_at} title={formattedDate}>
                {distanceToNow}
            </time>
        </li>
    );
}
