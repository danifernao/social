import { type User } from '@/types';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface UserFollowBtnProps {
    user: User; // Usuario al que se desea seguir o dejar de seguir.
}

/**
 * Muestra el botón para seguir o dejar de seguir a un usuario.
 */
export default function UserFollowBtn({ user }: UserFollowBtnProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleFollow = () => {
        setIsProcessing(true);
        router.post(
            route('follow.toggle', { user: user.username }),
            {},
            {
                preserveScroll: true,
                onError: (errors) => {
                    toast('¡Ups! Error inesperado.');
                    console.error(errors);
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <Button onClick={toggleFollow} disabled={isProcessing}>
            {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />} {user.isFollowing ? 'Dejar de seguir' : 'Seguir'}
        </Button>
    );
}
