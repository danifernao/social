import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface UserActionsAdminProps {
    user: User; // Usuario que se desea administrar.
}

/**
 * Botón para adaministrar a un usuario.
 */
export default function UserActionsAdmin({ user }: UserActionsAdminProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    return (
        <Button variant="ghost" className="w-full justify-start">
            <Link href={route('admin.user.edit', user.id)}>
                <UserCog className="h-4 w-4" />
                <span>{t('common.manage')}</span>
            </Link>
        </Button>
    );
}
