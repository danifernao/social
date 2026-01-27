import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface FollowPageNavProps {
    pageName: 'following' | 'followers'; // Identifica la sección actualmente activa.
    username: string; // Nombre de usuario del perfil que se está visualizando.
}

/**
 * Barra de navegación que permite alternar entre
 * las secciones de "Seguidos" y "Seguidores" de un perfil de usuario.
 */
export function FollowNav({ pageName, username }: FollowPageNavProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Clase base compartida por ambas pestañas.
    const baseClass =
        'text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4';

    // Clase aplicada únicamente a la pestaña activa.
    const activeClass = '!bg-background dark:bg-input/60 dark:text-foreground border-input shadow-sm';

    return (
        <nav className="bg-muted flex h-9 w-full items-center gap-1 rounded-lg p-[3px]">
            {/* Enlace a la sección de usuarios seguidos */}
            <Link
                href={route('follow.following', username)}
                aria-current={pageName === 'following' ? 'page' : undefined}
                className={cn(baseClass, pageName === 'following' && activeClass)}
            >
                {t('following')}
            </Link>

            {/* Enlace a la sección de seguidores */}
            <Link
                href={route('follow.followers', username)}
                aria-current={pageName === 'followers' ? 'page' : undefined}
                className={cn(baseClass, pageName === 'followers' && activeClass)}
            >
                {t('followers')}
            </Link>
        </nav>
    );
}
