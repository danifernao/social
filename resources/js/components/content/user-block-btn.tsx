import { User } from '@/types';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface BlockButtonProps {
    user: User; // El usuario sobre el cual se aplicará el bloqueo o desbloqueo.
}

/**
 * Muestra el botón para bloquear o desbloquear a un usuario.
 */
export default function BlockButton({ user }: BlockButtonProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleClick = () => {
        setIsProcessing(true);

        router.post(
            route('user.block', { user: user.username }),
            {},
            {
                preserveScroll: true,
                onError: (errors) => {
                    toast('¡Ups! Error inesperado.');
                    console.error(errors);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    return (
        <Button onClick={handleClick} disabled={isProcessing} variant="destructive">
            {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />} {user.isBlocked ? 'Desbloquear' : 'Bloquear'}
        </Button>
    );
}
