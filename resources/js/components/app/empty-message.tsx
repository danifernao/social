import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface EmptyMessageProps {
    custom?: string; // Mensaje personalizado.
}

/**
 * Muestra un mensaje dependiendo de la ruta actual de la página.
 */
export default function EmptyMessage({ custom = '' }: EmptyMessageProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura la ruta actual de la pagina proporcionada por Inertia.
    const { routeName } = usePage<{ routeName: string }>().props;

    let message = custom;

    if (!message) {
        switch (routeName) {
            case 'home.index':
            case 'profile.show':
                message = t('noResults.posts');
                break;
            case 'follow.following':
                message = t('noResults.following');
                break;
            case 'follow.followers':
                message = t('noResults.followers');
                break;
            case 'post.show':
                message = t('noResults.comments');
                break;
            case 'search.index':
                message = t('noResults.search');
                break;
            default:
                message = t('noResults.general');
                break;
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center text-center">
            <p>{message}</p>
        </div>
    );
}
