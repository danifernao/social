import { usePostAction } from '@/hooks/app/use-post-action';
import { type User } from '@/types';
import { getAnimatedButtonClasses } from '@/utils/buttonHelpers';
import { LoaderCircle, UserMinus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface UserFollowBtnProps {
    user: User; // Usuario al que se desea seguir o dejar de seguir.
}

/**
 * Muestra el botón para seguir o dejar de seguir a un usuario.
 */
export default function UserFollowBtn({ user }: UserFollowBtnProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    const { isProcessing, execute } = usePostAction();

    // Clases para animaciones del botón.
    const { iconClass, textClass } = getAnimatedButtonClasses(isProcessing);

    // Estado local del seguimiento del usuario.
    const [isFollowed, setIsFollowed] = useState(user.is_followed);

    // Alterna el estado de seguimiento (seguir/dejar de seguir).
    const toggleFollow = () => {
        execute(
            'follow.toggle',
            { user: user.username },
            {
                onSuccess: () => {
                    setIsFollowed((prev) => !prev);
                },
            },
        );
    };

    return (
        <Button className="group relative gap-0 overflow-hidden" onClick={toggleFollow} disabled={isProcessing}>
            {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isFollowed ? <UserMinus className={iconClass} /> : <UserPlus className={iconClass} />}
            <span className={textClass}>{isFollowed ? t('common.unfollow') : t('common.follow')}</span>
        </Button>
    );
}
