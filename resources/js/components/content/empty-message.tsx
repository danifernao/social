import { usePage } from '@inertiajs/react';

interface EmptyMessageProps {
    custom?: string; // Mensaje personalizado.
}

/**
 * Muestra un mensaje dependiendo de la ruta actual de la página.
 */
export default function EmptyMessage({ custom = '' }: EmptyMessageProps) {
    // Accede a la ruta actual de la pagina proporcionada por Inertia.
    const { routeName } = usePage<{ routeName: string }>().props;

    let message = custom;

    if (!message) {
        switch (routeName) {
            case 'home.show':
            case 'profile.show':
                message = 'Aún no hay publicaciones.';
                break;
            case 'follow.following':
                message = 'Este usuario no sigue a nadie por ahora.';
                break;
            case 'follow.followers':
                message = 'Este usuario aún no tiene seguidores.';
                break;
            case 'post.show':
                message = 'Nadie ha comentado aún.';
                break;
            case 'search.show':
            case 'search.hashtag':
                message = 'No se encontraron resultados.';
                break;
            default:
                message = 'No hay nada que mostrar aún.';
                break;
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center text-center">
            <p>{message}</p>
        </div>
    );
}
