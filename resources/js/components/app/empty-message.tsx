import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface EmptyMessageProps {
    custom?: string; // Mensaje personalizado opcional.
}

/**
 * Muestra un mensaje vacío contextual según la ruta actual
 * o un mensaje personalizado.
 */
export default function EmptyMessage({ custom = '' }: EmptyMessageProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Nombre de la ruta actual proporcionada por Inertia.
    const { routeName } = usePage<{ routeName: string }>().props;

    let message = custom;

    // Si no se proporciona un mensaje personalizado,
    // se determina el mensaje según la ruta actual.
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
