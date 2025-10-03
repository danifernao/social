import { useTranslation } from 'react-i18next';

interface UserRoleBadgeProps {
    role: string;
}

/**
 * Muestra una insignia de rol según el tipo de usuario.
 */
export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
    // No muestra nada si no es administrador o moderador.
    if (!['admin', 'mod'].includes(role)) {
        return null;
    }

    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Clase de la insignia según el rol.
    const styles = role === 'admin' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white';

    // Texto de la insignia según el rol.
    const label = role === 'admin' ? t('admin') : t('mod');

    // Texto accesible según el rol.
    const aria = role === 'admin' ? t('administrator') : t('moderator');

    return (
        <span className={`ml-2 rounded-md px-2 py-0.5 text-xs font-semibold ${styles}`} aria-label={aria} role="status">
            {label}
        </span>
    );
}
