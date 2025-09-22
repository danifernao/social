import { usePostAction } from '@/hooks/use-post-action';
import { User } from '@/types';
import { getAnimatedButtonClasses } from '@/utils/buttonHelpers';
import { LoaderCircle, Lock, LockOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface UserBlockBtnProps {
    user: User; // El usuario sobre el cual se aplicará el bloqueo o desbloqueo.
}

/**
 * Muestra el botón para bloquear o desbloquear a un usuario.
 */
export default function UserBlockBtn({ user }: UserBlockBtnProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    const { isProcessing, execute } = usePostAction();
    const { iconClass, textClass } = getAnimatedButtonClasses(isProcessing);

    return (
        <Button className="group relative gap-0 overflow-hidden" onClick={() => execute('user.block', { user: user.id })} disabled={isProcessing}>
            {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {user.is_blocked ? <LockOpen className={iconClass} /> : <Lock className={iconClass} />}
            <span className={textClass}>{user.is_blocked ? t('unblock') : t('block')}</span>
        </Button>
    );
}
