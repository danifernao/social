import { User } from '@/types';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface UserAvatarProps {
    user: User;
    className?: string;
}

/**
 * Muestra el avatar de un usuario.
 */
export default function UserAvatar({ user, className = 'w-10 h-10' }: UserAvatarProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Define las clases de Tailwind que corresponden a cada tamaño de avatar.
    return (
        <div className={`relative ${className}`}>
            <Link
                href={`/user/${user.username}`}
                className="flex h-full w-full items-center justify-center overflow-hidden rounded-sm bg-neutral-200 font-bold text-black dark:bg-neutral-700 dark:text-white"
            >
                {user.avatar_url ? (
                    <img src={user.avatar_url} alt={t('avatar')} className="size-full object-cover" />
                ) : (
                    <p className="flex size-full items-center justify-center">{user.username.charAt(0).toUpperCase()}</p>
                )}
            </Link>
        </div>
    );
}
