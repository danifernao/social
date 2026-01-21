import type { User } from '@/types';
import { Link } from '@inertiajs/react';
import UserActionsFollow from './user-actions-follow';
import UserAvatar from './user-avatar';
import UserRoleBadge from './user-role-badge';

interface UserListItemProps {
    user: User; // Usuario que se mostrará en el item de la lista.
}

/**
 * Elemento individual dentro de una lista de usuarios.
 *
 * Muestra:
 * - El avatar del usuario.
 * - El nombre de usuario con enlace a su perfil.
 * - La insignia de rol del usuario.
 * - Una acción para seguir o dejar de seguir, cuando aplica.
 */
export default function UserListItem({ user }: UserListItemProps) {
    return (
        <div className="bg-card text-card-foreground flex gap-6 rounded-xl border px-6 py-6 shadow-sm">
            {/* Sección izquierda: avatar y datos básicos del usuario */}
            <div className="flex flex-1 items-center justify-center gap-3">
                {/* Avatar del usuario */}
                <UserAvatar className="h-10 w-10" user={user} />

                <div className="flex flex-1 items-center font-semibold">
                    {/* Nombre del usuario */}
                    <Link href={route('profile.show', user.username)}>{user.username}</Link>

                    {/* Insignia de rol del usuario */}
                    <UserRoleBadge role={user.role} />
                </div>
            </div>

            {/* Sección derecha: acciones disponibles sobre el usuario */}
            {user.is_followed !== null && (
                <div className="flex items-center justify-center gap-4">
                    {/* Seguimiento de usuario */}
                    <UserActionsFollow user={user} />
                </div>
            )}
        </div>
    );
}
