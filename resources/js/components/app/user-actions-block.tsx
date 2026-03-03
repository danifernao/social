import { usePostAction } from '@/hooks/app/use-post-action';
import { User } from '@/types';
import { LoaderCircle, Lock, LockOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface UserActionsBlockProps {
    user: User; // El usuario sobre el cual se aplicará el bloqueo o desbloqueo.
}

/**
 * Botón para bloquear o desbloquear a un usuario.
 */
export default function UserActionsBlock({ user }: UserActionsBlockProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Hook para ejecutar acciones POST.
    const { isProcessing, execute } = usePostAction();

    // Alterna el estado de bloqueo.
    const toggleBlock = () => {
        execute(
            'user.block',
            { user: user.id },
            {
                preserveState: false,
            },
        );
    };

    return (
        <Button variant="ghost" className="w-full justify-start" onClick={toggleBlock} disabled={isProcessing}>
            {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {user.is_blocked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            <span>{user.is_blocked ? t('unblock') : t('block')}</span>
        </Button>
    );
}
