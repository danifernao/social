import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseAdminActionFormOptions<T> {
    initialData: T;
    route: string | ((...args: any[]) => string);
    onSuccess?: (action: string, response: any) => void;
}

// Hook genérico para formularios administrativos que requieren confirmación de contraseña.
export function useAdminActionForm<T extends Record<string, any>>({ initialData, route: formRoute, onSuccess }: UseAdminActionFormOptions<T>) {
    // Formulario de Inertia con los datos iniciales.
    const form = useForm({ ...initialData, action: '', pass_confirmation: '' });

    // Estado para controlar el diálogo de confirmación.
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Acción pendiente que requiere confirmación.
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    // Restaura los valores iniciales del formulario.
    const resetForm = () => {
        form.setData((prev) => ({
            ...prev,
            action: '',
            pass_confirmation: '',
        }));
        form.clearErrors();
    };

    // Abre el diálogo y registra la acción pendiente.
    const handleAction = (action: string) => {
        resetForm();
        setPendingAction(action);
        setIsDialogOpen(true);
    };

    // Confirma la acción: coloca la contraseña y la acción en el formulario.
    const confirmAction = () => {
        form.setData((prev) => ({
            ...prev,
            action: pendingAction ?? '',
        }));
        setIsDialogOpen(false);
        setPendingAction(null);
    };

    // Envía los datos. Permite ejecutar un callback para manejar actualizaciones locales.
    const sendData = () => {
        form.patch(typeof formRoute === 'function' ? formRoute() : formRoute, {
            preserveScroll: true,
            onSuccess: (page) => {
                onSuccess?.(form.data.action, page);
                toast('¡Cambios guardados!');
            },
        });
    };

    // Cierra el diálogo.
    const closeDialog = () => {
        setIsDialogOpen(false);
        setPendingAction(null);
        resetForm();
    };

    // Efecto que dispara el envío automático cuando la acción cambia.
    useEffect(() => {
        if (form.data.action) {
            sendData();
        }
    }, [form.data.action]);

    return {
        form,
        isDialogOpen,
        handleAction,
        confirmAction,
        closeDialog,
    };
}
