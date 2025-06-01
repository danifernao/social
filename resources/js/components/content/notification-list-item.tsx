import type { Notification } from '@/types';
import { Link, router } from '@inertiajs/react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface NotificationListItemProps {
    notification: Notification;
}

/**
 * Muestra una notificación y la marca como leída al hacer clic en ella.
 */
export default function NotificationListItem({ notification }: NotificationListItemProps) {
    // Tipo de notificación.
    const type = notification.data.type;

    // Usuario que generó la notificación (remitente).
    const sender = notification.data.data.sender;

    // Contexto adicional relacionado con la notificación.
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

    // Marca la notificación como leída si no lo está y visita el enlace.
    const markAsRead = (e: React.MouseEvent, url: string) => {
        if (!notification.read_at) {
            e.preventDefault();

            router.patch(
                route('notification.markOneAsRead', { id: notification.id }),
                {},
                {
                    preserveUrl: true,
                    onError: (errors) => {
                        toast('¡Ups! Error inesperado.');
                        console.error(errors);
                    },
                    onFinish: () => {
                        router.visit(url);
                    },
                },
            );
        }
    };

    return (
        <li className={`flex flex-col border-b px-4 py-4 last:border-b-0 ${notification.read_at ? 'text-gray-500' : ''}`}>
            <Link href={url} onClick={(e) => markAsRead(e, url)}>
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
