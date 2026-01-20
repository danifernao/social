import { usePostAction } from '@/hooks/app/use-post-action';
import { type User } from '@/types';
import { LoaderCircle, UserMinus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface UserActionsFollowProps {
    user: User; // Usuario al que se desea seguir o dejar de seguir.
}

/**
 * Botón para seguir o dejar de seguir a un usuario.
 */
export default function UserActionsFollow({ user }: UserActionsFollowProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Hook para ejecutar acciones POST.
    const { isProcessing, execute } = usePostAction();

    // Estado local que refleja si el usuario está siendo seguido.
    const [isFollowed, setIsFollowed] = useState(user.is_followed);

    // Alterna el estado de seguimiento.
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
        <Button onClick={toggleFollow} disabled={isProcessing}>
            {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isFollowed ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            <span>{isFollowed ? t('common.unfollow') : t('common.follow')}</span>
        </Button>
    );
}
