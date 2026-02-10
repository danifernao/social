import ListLoadMore from '@/components/app/list-load-more';
import NotificationHeader from '@/components/app/notification-header';
import NotificationList from '@/components/app/notification-list';
import { usePaginatedData } from '@/hooks/app/use-paginated-data';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem, Notification, Notifications } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * Vista que muestra el listado de notificaciones del usuario autenticado.
 */
export default function NotificationIndex() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura la lista de notificaciones proporcionada por Inertia.
    const { notifications } = usePage<{ notifications: Notifications }>().props;

    // Indica si está en curso el proceso de marcar todas las notificaciones como leídas.
    const [isMarkReadProcessing, setIsMarkReadProcessing] = useState(false);

    // Usa el hook de paginación para gestionar el listado de notificaciones.
    const {
        items: notificationsList, // Lista actual de notificaciones visibles.
        nextCursor, // Cursor para solicitar la siguiente página de notificaciones.
        processing, // Indica si se está cargando más contenido.
        loadMore, // Función para cargar más notificaciones.
        updateItems, // Función para actualizar manualmente la lista de notificaciones.
    } = usePaginatedData<Notification>({
        initialItems: notifications.data, // Notificaciones iniciales cargadas desde el servidor.
        initialCursor: notifications.meta.next_cursor, // Cursor inicial de paginación.
        propKey: 'notifications', // Propiedad de la respuesta de Inertia que contiene los datos.
    });

    // Marca todas las notificaciones como leídas.
    const markAsRead = () => {
        setIsMarkReadProcessing(true);

        router.patch(
            route('notification.markAllAsRead'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                preserveUrl: true,
                // Al finalizar correctamente, actualiza el estado local
                // marcando cada notificación como leída.
                onSuccess: () => {
                    const newNotifications = notificationsList.map((n) => ({ ...n, read_at: new Date().toISOString() }));
                    updateItems(newNotifications);
                },
                onError: (errors) => {
                    toast.error(t('unexpected_error'));

                    if (import.meta.env.DEV) {
                        console.error(errors);
                    }
                },
                onFinish: () => {
                    setIsMarkReadProcessing(false);
                },
            },
        );
    };

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('notifications'),
            href: route('notification.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('notifications')} />

            <AppContentLayout>
                {/* Encabezado con acciones de notificaciones */}
                <NotificationHeader markAsRead={markAsRead} isProcessing={isMarkReadProcessing} />

                {/* Listado de notificaciones */}
                <NotificationList notifications={notificationsList} />

                {/* Botón para cargar más notificaciones */}
                <ListLoadMore type="notification" cursor={nextCursor} isProcessing={processing} onClick={loadMore} />
            </AppContentLayout>
        </AppLayout>
    );
}
