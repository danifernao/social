import NotificationListItem from '@/components/app/notification-list-item';
import type { Notification } from '@/types';
import EmptyMessage from './empty-message';

interface NotificationListProps {
    notifications: Notification[]; // Lista de notificaciones.
}

/**
 * Muestra una lista de notificaciones.
 */
export default function NotificationList({ notifications }: NotificationListProps) {
    return (
        <>
            {notifications.length > 0 ? (
                <ul className="flex flex-1 flex-col">
                    {notifications.map((notification) => (
                        <NotificationListItem key={notification.id} notification={notification} />
                    ))}
                </ul>
            ) : (
                <div className="flex flex-1 flex-col">
                    <EmptyMessage />
                </div>
            )}
        </>
    );
}
