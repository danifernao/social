import { canActOnUser } from '@/lib/utils';
import type { Auth, User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import UserAdminBtn from './user-admin-btn';
import UserAvatar from './user-avatar';
import UserBlockBtn from './user-block-btn';
import UserFollowBtn from './user-follow-btn';
import UserRoleBadge from './user-role-badge';

interface ProfileHeaderProps {
    user: User; // Usuario del perfil visitado.
}

/**
 * Encabezado del perfil público de un usuario.
 */
export default function ProfileHeader({ user }: ProfileHeaderProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Avatar e información principal del usuario */}
            <div className="flex items-center gap-4">
                {/* Avatar del usuario */}
                <UserAvatar className="h-24 w-24 text-4xl" user={user} />

                <div className="flex flex-col">
                    {/* Nombre de usuario y rol */}
                    <h1 className="flex items-center text-3xl">
                        <span>@{user.username}</span>
                        <UserRoleBadge role={user.role} />
                    </h1>

                    {/* Contadores de seguimiento */}
                    <div className="flex gap-3">
                        <Link href={`/user/${user.username}/following`} className="lowercase">
                            {user.follows_count} {t('common.following')}
                        </Link>

                        <Link href={`/user/${user.username}/followers`} className="lowercase">
                            {user.followers_count} {t('common.followers')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Acciones disponibles sobre el perfil */}
            {auth.user && auth.user.id !== user.id && (
                <div className="flex flex-wrap justify-end gap-2">
                    {/* Botón para seguir o dejar de seguir */}
                    {!user.is_blocked && !user.has_blocked && <UserFollowBtn user={user} />}

                    {/* Botón para bloquear al usuario */}
                    {auth.user.role !== 'admin' && user.role !== 'admin' && !user.has_blocked && <UserBlockBtn user={user} />}

                    {/* Botón para administrar al usuario */}
                    {canActOnUser(user) && <UserAdminBtn user={user} />}
                </div>
            )}
        </div>
    );
}
