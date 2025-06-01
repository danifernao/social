import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface FollowPageNavProps {
    pageName: 'following' | 'followers'; // Nombre de la sección actual.
    username: string; // Nombre de usuario del perfil visitado.
}

/**
 * Muestra la barra de navegación entre las secciones de "Seguidos" y "Seguidores" de un usuario.
 */
export function FollowNav({ pageName, username }: FollowPageNavProps) {
    const baseClass =
        'text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4';

    const activeClass = '!bg-background dark:bg-input/60 dark:text-foreground border-input shadow-sm';

    return (
        <nav className="bg-muted flex h-9 w-full items-center gap-1 rounded-lg p-[3px]">
            <Link
                href={`/user/${username}/following`}
                aria-current={pageName === 'following' ? 'page' : undefined}
                className={cn(baseClass, pageName === 'following' && activeClass)}
            >
                Seguidos
            </Link>
            <Link
                href={`/user/${username}/followers`}
                aria-current={pageName === 'followers' ? 'page' : undefined}
                className={cn(baseClass, pageName === 'followers' && activeClass)}
            >
                Seguidores
            </Link>
        </nav>
    );
}
