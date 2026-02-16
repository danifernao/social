import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import UserAvatar from '../app/user-avatar';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const { t } = useTranslation();
    return (
        <>
            <UserAvatar className="h-8 w-8 flex-shrink-0" user={user} />
            <Link
                href={route('profile.show', user.username)}
                className="flex items-center gap-2"
                title={t('user_profile', { username: user.username })}
            >
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.username}</span>
                    {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
                </div>
            </Link>
        </>
    );
}
