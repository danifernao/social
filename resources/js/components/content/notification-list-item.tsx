import type { Notification } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { format, formatDistanceToNow, Locale, parseISO } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface NotificationListItemProps {
    notification: Notification;
}

/**
 * Muestra una notificación y la marca como leída al hacer clic en ella.
 */
export default function NotificationListItem({ notification }: NotificationListItemProps) {
    // Obtiene las traducciones de la página.
    const { i18n } = useTranslation('common');

    // Captura el token CSRF proporcionado por Inertia.
    // Este token es necesario para que Laravel acepte la solicitud PATCH.
    const { csrfToken } = usePage<{ csrfToken: string }>().props;

    // Referencia del elemento HTML que contiene la notificaión.
    // Esta referencia se usará con IntersectionObserver para detectar cuándo está visible.
    const notificationRef = useRef<HTMLLIElement | null>(null);

    // Evita que el IntersectionObserver dispare múltiples peticiones si se activa más de una vez.
    const hasTriggeredRequest = useRef(false);

    // Estado que indica si la notificación debe mostrarse como leída en la interfaz.
    const [shouldShowAsRead, setShouldShowAsRead] = useState(false);

    // Tipo de notificación.
    const type = notification.data.type;

    // Usuario que generó la notificación (remitente).
    const sender = notification.data.data.sender;

    // Fuente de la notificación. Puede ser una publicación o un comentario.
    const context = notification.data.data.context;

    // URL de destino de la notificación.
    const url = context ? `/post/${context.id}` : `/user/${sender.username}`;

    // Relación entre idioma y formato de fecha.
    const localeMap: Record<string, Locale> = {
        es,
        en: enUS,
    };

    // Selecciona el idioma adecuado según el idioma actual de la aplicación.
    const locale = localeMap[i18n.language] ?? es;

    // Fecha de creación de la notificación en formato corto y legible.
    const formattedDate = format(parseISO(notification.created_at), 'dd/MM/yyyy h:mm a');

    // Tiempo relativo en español desde que se creó la notificación.
    const distanceToNow = formatDistanceToNow(new Date(notification.created_at), {
        addSuffix: true,
        locale,
    });

    // Marca la notificación como leída si no lo está.
    useEffect(() => {
        if (notification.read_at || !notificationRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTriggeredRequest.current) {
                    hasTriggeredRequest.current = true;

                    // Se hace una petición PATCH para marcar la notificación como leída.
                    fetch(route('notification.markOneAsRead', { id: notification.id }), {
                        method: 'PATCH',
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                            Accept: 'application/json',
                        },
                    })
                        .then((response) => {
                            if (!response.ok) throw new Error('Failed');
                            return response.json();
                        })
                        .then((data) => {
                            if (data.status === 'ok') {
                                setShouldShowAsRead(true);
                            }
                        })
                        .catch((errors) => {
                            console.error(errors);
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
        <li
            ref={notificationRef}
            className={`flex flex-col border-b px-4 py-4 last:border-b-0 ${notification.read_at || shouldShowAsRead ? 'text-gray-500' : ''}`}
        >
            <Link href={url}>
                {type === 'follow' && (
                    <Trans i18nKey="hasFollowedYou" ns="common" values={{ username: sender.username }} components={[<strong />, <strong />]} />
                )}

                {type === 'comment' && (
                    <Trans i18nKey="hasCommented" ns="common" values={{ username: sender.username }} components={[<strong />, <strong />]} />
                )}

                {type === 'mention' && context && context.type === 'post' && (
                    <Trans i18nKey="hasMentionedYouInPost" ns="common" values={{ username: sender.username }} components={[<strong />, <strong />]} />
                )}

                {type === 'mention' && context && context.type === 'comment' && (
                    <Trans
                        i18nKey="hasMentionedYouInComment"
                        ns="common"
                        values={{ username: sender.username }}
                        components={[<strong />, <strong />]}
                    />
                )}
            </Link>
            <time className="text-sm" dateTime={notification.created_at} title={formattedDate}>
                {distanceToNow}
            </time>
        </li>
    );
}
