import NotificationItem from '@/components/app/notifications/item';
import type { Notification } from '@/types';
import EmptyMessage from '../shared/empty-message';

interface NotificationListProps {
    notifications: Notification[];
}

/**
 * Listado de notificaciones del usuario.
 */
export default function NotificationList({ notifications }: NotificationListProps) {
    return (
        <>
            {notifications.length > 0 ? (
                <ul className="flex flex-1 flex-col">
                    {notifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
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
