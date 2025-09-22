import type { Auth, User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import UserAdminBtn from './user-admin-btn';
import UserAvatar from './user-avatar';
import UserBlockBtn from './user-block-btn';
import UserFollowBtn from './user-follow-btn';

interface ProfileHeaderProps {
    user: User; // Usuario del perfil visitado.
}

/**
 * Muestra el encabezado de la página de perfil de un usuario
 * junto con los botones para seguirlo y bloquearlo.
 */
export default function ProfileHeader({ user }: ProfileHeaderProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <div className="flex gap-1">
            <div className="flex flex-1 flex-col gap-4">
                <UserAvatar className="h-24 w-24 text-4xl" user={user} />
                <div className="flex flex-1 flex-col gap-1">
                    <div className="flex flex-col gap-4">
                        <h1 className="flex-1 text-3xl">@{user.username}</h1>
                    </div>
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
            {auth.user && auth.user.id !== user.id && (
                <div className="flex flex-wrap justify-end gap-2">
                    {!user.is_blocked && !user.has_blocked && <UserFollowBtn user={user} />}
                    {auth.user.role !== 'admin' && user.role !== 'admin' && !user.has_blocked && <UserBlockBtn user={user} />}
                    {auth.user.role === 'admin' && <UserAdminBtn user={user} />}
                </div>
            )}
        </div>
    );
}
