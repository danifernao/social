import UserListItem from '@/components/content/user-list-item';
import type { User } from '@/types';
import EmptyMessage from './empty-message';

interface UserListProps {
    users: User[]; // Lista de usuarios.
}

/**
 * Muestra una lista de usuarios.
 */
export default function UserList({ users }: UserListProps) {
    return (
        <div className="flex flex-1 flex-col gap-8">
            {users.length > 0 ? users.map((user) => <UserListItem key={user.id} user={user} />) : <EmptyMessage />}
        </div>
    );
}
