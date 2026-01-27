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
                message = t('no_posts_yet');
                break;

            case 'follow.following':
                message = t('user_follows_no_one');
                break;

            case 'follow.followers':
                message = t('user_has_no_followers');
                break;

            case 'post.show':
                message = t('no_comments_yet');
                break;

            case 'search.index':
                message = t('no_results_found');
                break;

            default:
                message = t('nothing_to_show_yet');
                break;
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center text-center">
            <p>{message}</p>
        </div>
    );
}
