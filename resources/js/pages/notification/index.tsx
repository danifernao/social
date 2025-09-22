import ListLoadMore from '@/components/content/list-load-more';
import NotificationHeader from '@/components/content/notification-header';
import NotificationList from '@/components/content/notification-list';
import { usePaginatedData } from '@/hooks/use-paginated-data';
import AppLayout from '@/layouts/app-layout';
import { AppContentLayout } from '@/layouts/app/app-content-layout';
import type { BreadcrumbItem, Notification, Notifications } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * Muestra la página de notificaciones del usuario autenticado.
 */
export default function Notifications() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura la lista de notificaciones proporcionada por Inertia.
    const { notifications } = usePage<{ notifications: Notifications }>().props;

    // Estado local que indica si está en curso el proceso de marcar las notificaciones como leídas.
    const [isMarkReadProcessing, setIsMarkReadProcessing] = useState(false);

    const {
        items: notificationsList, // Lista de notificaciones actuales.
        cursor, // Cursor para la siguiente página de notificaciones.
        processing, // Indica si se está cargando más notificaciones.
        loadMore, // Función para cargar más notificaciones.
        updateItems, //
    } = usePaginatedData<Notification>({
        initialItems: notifications.data, // Lista inicial de notificaciones.
        initialCursor: notifications.meta.next_cursor, // Cursor inicial.
        fetchUrl: route('notification.show'), // Ruta para solicitar más notificaciones.
        propKey: 'notifications', // Nombre de la propiedad que devuelve Inertia con los datos a usar.
    });

    // Marca las notificaciones como leídas.
    const markAsRead = () => {
        setIsMarkReadProcessing(true);

        router.patch(
            route('notification.markAllAsRead'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                preserveUrl: true,
                // Al finalizar correctamente, actualiza la lista marcando cada notificación como leída.
                onSuccess: () => {
                    const newNotifications = notificationsList.map((n) => ({ ...n, read_at: new Date().toISOString() }));
                    updateItems(newNotifications);
                },
                onError: (errors) => {
                    toast('¡Ups! Error inesperado.');
                    console.error(errors);
                },
                onFinish: () => {
                    setIsMarkReadProcessing(false);
                },
            },
        );
    };

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('notifications'),
            href: route('notification.show'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('notifications')} />
            <AppContentLayout>
                <NotificationHeader markAsRead={markAsRead} isProcessing={isMarkReadProcessing} />
                <NotificationList notifications={notificationsList} />
                <ListLoadMore type="notification" cursor={cursor} isProcessing={processing} onClick={loadMore} />
            </AppContentLayout>
        </AppLayout>
    );
}
