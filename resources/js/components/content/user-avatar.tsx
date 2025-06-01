import { Link } from '@inertiajs/react';

interface UserAvatarProps {
    size: 's10' | 's24'; // Clave que determina el tamaño del avatar.
    username: string; // Nombre de usuario al que se vincula el avatar.
    url: string | null; // URL de la imagen del avatar.
}

/**
 * Muestra el avatar de un usuario.
 */
export default function UserAvatar({ size, username, url }: UserAvatarProps) {
    // Define las clases de Tailwind que corresponden a cada tamaño de avatar.
    const classes = {
        s10: 'h-10 w-10',
        s24: 'h-24 w-24 text-4xl',
    };

    return (
        <div className={`relative ${classes[size]}`}>
            <Link
                href={`/user/${username}`}
                className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-neutral-200 font-bold text-black dark:bg-neutral-700 dark:text-white"
            >
                {url ? (
                    <img src={url} alt="Avatar" className="size-full object-cover" />
                ) : (
                    <p className="flex size-full items-center justify-center">{username.charAt(0).toUpperCase()}</p>
                )}
            </Link>
        </div>
    );
}
