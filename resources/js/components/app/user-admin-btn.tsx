import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface UserFollowBtnProps {
    user: User; // Usuario al que se desea seguir o dejar de seguir.
}

/**
 * Muestra el botón para seguir o dejar de seguir a un usuario.
 */
export default function UserAdminBtn({ user }: UserFollowBtnProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    return (
        <Button asChild className="group relative gap-0 overflow-hidden">
            <Link href={route('admin.user.edit', user.id)}>
                <UserCog className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 group-hover:ml-2 group-hover:max-w-xs">
                    {t('manage')}
                </span>
            </Link>
        </Button>
    );
}
