import UserItem from '@/components/app/users/item';
import type { User } from '@/types';
import EmptyMessage from '../empty-message';

interface UserListProps {
    users: User[];
}

/**
 * Listado de usuarios.
 */
export default function UserList({ users }: UserListProps) {
    return (
        <div className="flex flex-1 flex-col gap-8">
            {users.length > 0 ? users.map((user) => <UserItem key={user.id} user={user} />) : <EmptyMessage />}
        </div>
    );
}
