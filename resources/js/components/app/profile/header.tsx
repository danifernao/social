import type { Auth, User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import UserActions from '../users/actions/actions';
import UserAvatar from '../users/avatar';
import UserRoleBadge from '../users/role-badge';

interface ProfileHeaderProps {
    user: User;
}

/**
 * Encabezado del perfil público de un usuario.
 */
export default function ProfileHeader({ user }: ProfileHeaderProps) {
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
                            {user.follows_count} {t('following')}
                        </Link>

                        <Link href={`/user/${user.username}/followers`} className="lowercase">
                            {user.followers_count} {t('followers')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Acciones disponibles sobre el perfil */}
            {auth.user && auth.user.id !== user.id && (
                <div className="flex flex-wrap justify-end gap-2">
                    <UserActions user={user} />
                </div>
            )}
        </div>
    );
}
