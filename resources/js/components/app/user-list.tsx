import UserListItem from '@/components/app/user-list-item';
import type { User } from '@/types';
import EmptyMessage from './empty-message';

interface UserListProps {
    users: User[]; // Lista de usuarios a mostrar.
}

/**
 * Listado de usuarios.
 */
export default function UserList({ users }: UserListProps) {
    return (
        <div className="flex flex-1 flex-col gap-8">
            {users.length > 0 ? users.map((user) => <UserListItem key={user.id} user={user} />) : <EmptyMessage />}
        </div>
    );
}
