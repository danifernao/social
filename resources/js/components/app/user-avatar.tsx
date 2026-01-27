import { User } from '@/types';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface UserAvatarProps {
    user: User; // Usuario del cual se mostrará el avatar.
    className?: string; // Clases opcionales para controlar el tamaño y estilo del avatar.
}

/**
 * Avatar de un usuario.
 */
export default function UserAvatar({ user, className = 'w-10 h-10' }: UserAvatarProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    return (
        <div className={`relative ${className}`}>
            <Link
                href={route('profile.show', user.username)}
                className="flex h-full w-full items-center justify-center overflow-hidden rounded-sm bg-neutral-200 font-bold text-black dark:bg-neutral-700 dark:text-white"
            >
                {user.avatar_url ? (
                    // Si el usuario tiene una URL de avatar, se renderiza la imagen.
                    <img src={user.avatar_url} alt={t('avatar')} className="size-full object-cover" />
                ) : (
                    // Si el usuario no tiene avatar, se muestra la inicial de su nombre de usuario.
                    <p className="flex size-full items-center justify-center">{user.username.charAt(0).toUpperCase()}</p>
                )}
            </Link>
        </div>
    );
}
