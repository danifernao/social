import { formatDate, isAuthUser } from '@/lib/utils';
import type { Notification, User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { formatDistanceToNow, Locale } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface NotificationListItemProps {
    notification: Notification; // Notificación a mostrar.
}

/**
 * Elemento individual del listado de notificaciones.
 * Se marca como leída automáticamente cuando entra en pantalla.
 */
export default function NotificationListItem({ notification }: NotificationListItemProps) {
    // Función para traducir los textos de la interfaz y acceder al idioma actual.
    const { i18n } = useTranslation();

    // Captura el token CSRF proporcionado por Inertia.
    // Este token es necesario para que Laravel acepte la solicitud PATCH.
    const { csrfToken } = usePage<{ csrfToken: string }>().props;

    // Referencia del elemento HTML que contiene la notificaión.
    // Esta referencia se usará con IntersectionObserver para detectar cuándo está visible.
    const notificationRef = useRef<HTMLLIElement | null>(null);

    // Evita que el IntersectionObserver dispare múltiples peticiones si se activa más de una vez.
    const hasTriggeredRequest = useRef(false);

    // Controla el estado visual de la notificación una vez marcada como leída.
    const [shouldShowAsRead, setShouldShowAsRead] = useState(false);

    // Tipo de notificación.
    const type = notification.data.type;

    // Usuario que generó la notificación (remitente).
    const sender = notification.data.data.sender;

    // Contexto asociado a la notificación (publicación o comentario).
    const context = notification.data.data.context;

    // URL de destino según el contexto de la notificación.
    const url = context ? `/${context.type}/${context.id}` : `/user/${sender.username}`;

    // Relación entre idioma y configuración regional para fechas.
    const localeMap: Record<string, Locale> = {
        es,
        en: enUS,
    };

    // Idioma activo para el formateo de fechas.
    const locale = localeMap[i18n.currentLang] ?? enUS;

    // Tiempo relativo desde la creación de la notificación.
    const distanceToNow = formatDistanceToNow(new Date(notification.created_at), {
        addSuffix: true,
        locale,
    });

    // Marca la notificación como leída cuando es visible en pantalla.
    useEffect(() => {
        if (notification.read_at || !notificationRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTriggeredRequest.current) {
                    hasTriggeredRequest.current = true;

                    fetch(route('notification.markOneAsRead', notification.id), {
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
                                setTimeout(() => {
                                    setShouldShowAsRead(true);
                                }, 3000);
                            }
                        })
                        .catch((errors) => {
                            console.error(errors);
                        });
                }
            },
            {
                threshold: 0.5, // Se considera visible cuando al menos la mitad está en pantalla.
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
            {/* Enlace de la notificación */}
            <Link href={url}>
                {/* Notificación de seguimiento */}
                {type === 'follow' && (
                    <Trans i18nKey="user_has_followed_you" values={{ username: sender.username }} components={[<strong />, <strong />]} />
                )}

                {/* Notificación de publicación en el perfil */}
                {type === 'post' && (
                    <Trans i18nKey="user_has_post_on_your_profile" values={{ username: sender.username }} components={[<strong />, <strong />]} />
                )}

                {/* Notificación de comentario */}
                {type === 'comment' &&
                    context &&
                    (isAuthUser({ id: context.author_id } as User) ? (
                        /* Comentario en una publicación propia */
                        <Trans
                            i18nKey="user_has_commented_in_your_post"
                            values={{ username: sender.username }}
                            components={[<strong />, <strong />]}
                        />
                    ) : (
                        /* Comentario en una publicación ajena */
                        <Trans i18nKey="user_has_commented_in_post" values={{ username: sender.username }} components={[<strong />, <strong />]} />
                    ))}

                {/* Mención en una publicación */}
                {type === 'mention' && context && context.type === 'post' && (
                    <Trans i18nKey="user_has_mentioned_you_in_post" values={{ username: sender.username }} components={[<strong />, <strong />]} />
                )}

                {/* Mención en un comentario */}
                {type === 'mention' && context && context.type === 'comment' && (
                    <Trans i18nKey="user_has_mentioned_you_in_comment" values={{ username: sender.username }} components={[<strong />, <strong />]} />
                )}
            </Link>

            {/* Fecha relativa de la notificación */}
            <time className="text-sm" dateTime={notification.created_at} title={formatDate(notification.created_at)}>
                {distanceToNow}
            </time>
        </li>
    );
}
