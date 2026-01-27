import { useTranslation } from 'react-i18next';

interface UserRoleBadgeProps {
    role: string; // Rol del usuario.
}

/**
 * Insignia de rol del usuario.
 */
export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
    // Evita renderizar la insignia si el rol no es administrador ni moderador.
    if (!['admin', 'mod'].includes(role)) {
        return null;
    }

    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Define las clases de Tailwind según el rol del usuario.
    const styles = role === 'admin' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white';

    // Define el texto corto que se muestra dentro de la insignia.
    const label = role === 'admin' ? t('admin') : t('mod');

    // Define el texto accesible que describe el rol de forma completa.
    // Se utiliza como etiqueta ARIA para lectores de pantalla.
    const aria = role === 'admin' ? t('administrator') : t('moderator');

    return (
        <span className={`ml-2 rounded-md px-2 py-0.5 text-xs font-semibold ${styles}`} aria-label={aria} role="status">
            {label}
        </span>
    );
}
