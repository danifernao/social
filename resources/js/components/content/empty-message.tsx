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
    const { t } = useTranslation('common');

    // Captura la ruta actual de la pagina proporcionada por Inertia.
    const { routeName } = usePage<{ routeName: string }>().props;

    let message = custom;

    if (!message) {
        switch (routeName) {
            case 'home.show':
            case 'profile.show':
                message = t('text.noPosts');
                break;
            case 'follow.following':
                message = t('text.noFollowing');
                break;
            case 'follow.followers':
                message = t('text.noFollowers');
                break;
            case 'post.show':
                message = t('text.noComments');
                break;
            case 'search.show':
            case 'search.hashtag':
                message = t('text.noResults');
                break;
            default:
                message = t('text.empty');
                break;
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center text-center">
            <p>{message}</p>
        </div>
    );
}
