import type { User } from '@/types';
import { Link } from '@inertiajs/react';
import UserActionsFollow from './user-actions-follow';
import UserAvatar from './user-avatar';
import UserRoleBadge from './user-role-badge';

interface UserListItemProps {
    user: User;
}

/**
 * Muestra el avatar y el nombre de usuario de un usuario,
 * junto con un botón para seguirlo o dejar de seguirlo.
 */
export default function UserListItem({ user }: UserListItemProps) {
    return (
        <div className="bg-card text-card-foreground flex gap-6 rounded-xl border px-6 py-6 shadow-sm">
            <div className="flex flex-1 items-center justify-center gap-3">
                <UserAvatar className="h-10 w-10" user={user} />
                <div className="flex flex-1 items-center font-semibold">
                    <Link href={route('profile.show', user.username)}>{user.username}</Link>
                    <UserRoleBadge role={user.role} />
                </div>
            </div>
            {user.is_followed !== null && (
                <div className="flex items-center justify-center gap-4">
                    <UserActionsFollow user={user} />
                </div>
            )}
        </div>
    );
}
