import type { User } from '@/types';
import { Link } from '@inertiajs/react';
import UserAvatar from './user-avatar';
import BlockButton from './user-block-btn';
import UserFollowBtn from './user-follow-btn';

interface ProfileHeaderProps {
    user: User; // Usuario del perfil visitado.
}

/**
 * Muestra el encabezado de la página de perfil de un usuario
 * junto con los botones para seguirlo y bloquearlo.
 */
export default function ProfileHeader({ user }: ProfileHeaderProps) {
    return (
        <div className="flex items-center gap-4">
            <UserAvatar size="s24" url={user.avatar_url} username={user.username} />
            <div className="flex flex-1 flex-col gap-1">
                <div className="flex flex-1 items-center justify-center gap-4">
                    <h1 className="flex-1 text-4xl">@{user.username}</h1>
                    <div className="flex flex-wrap gap-3">
                        {user.isFollowing !== null && !user.isBlocked && <UserFollowBtn user={user} />}
                        {user.isBlocked !== null && <BlockButton user={user} />}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/user/${user.username}/following`}>{user.follows_count} seguidos</Link>
                    <Link href={`/user/${user.username}/followers`}>{user.followers_count} seguidores</Link>
                </div>
            </div>
        </div>
    );
}
