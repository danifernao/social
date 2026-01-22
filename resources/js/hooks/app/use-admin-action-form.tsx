import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseAdminActionFormOptions<T> {
    // Datos iniciales que serán cargados en el formulario.
    initialData: T;

    // Ruta a la que se enviará el formulario.
    // Puede ser una string directa o una función que devuelva la ruta.
    route: string | ((...args: any[]) => string);

    // Callback opcional que se ejecuta cuando la acción se completa con éxito.
    onSuccess?: (action: string, response: any) => void;
}

/**
 * Hook genérico para manejar formularios administrativos
 * que requieren confirmación mediante contraseña privilegiada
 * antes de ejecutar una acción sensible.
 */
export function useAdminActionForm<T extends Record<string, any>>({ initialData, route: formRoute, onSuccess }: UseAdminActionFormOptions<T>) {
    // Inicializa el formulario de Inertia.
    const form = useForm({ ...initialData, action: '', privileged_password: '' });

    // Controla la visibilidad del diálogo de confirmación de contraseña.
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Almacena temporalmente la acción que el usuario intenta
    // ejecutar y que requiere confirmación.
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    /**
     * Restaura los valores iniciales del formulario
     * y limpia cualquier error previo.
     */
    const resetForm = () => {
        form.setData((prev) => ({
            ...prev,
            action: '',
            privileged_password: '',
        }));
        form.clearErrors();
    };

    /**
     * Registra una acción administrativa pendiente
     * y abre el diálogo de confirmación.
     */
    const handleAction = (action: string) => {
        resetForm();
        setPendingAction(action);
        setIsDialogOpen(true);
    };

    /**
     * Confirma la acción administrativa. Asigna la acción pendiente
     * al formulario cierra el diálogo de confirmación.
     */
    const confirmAction = () => {
        form.setData((prev) => ({
            ...prev,
            action: pendingAction ?? '',
        }));
        setIsDialogOpen(false);
        setPendingAction(null);
    };

    /**
     * Envía los datos. Permite ejecutar un callback opcional tras
     * una respuesta exitosa.
     */
    const sendData = () => {
        form.patch(typeof formRoute === 'function' ? formRoute() : formRoute, {
            preserveScroll: true,
            onSuccess: (page) => {
                onSuccess?.(form.data.action, page);
                toast('¡Cambios guardados!');
            },
        });
    };

    /**
     * Cierra el diálogo de confirmación, limpia la acción pendiente
     * y reinicia el formulario.
     */
    const closeDialog = () => {
        setIsDialogOpen(false);
        setPendingAction(null);
        resetForm();
    };

    /**
     * Observa el campo "action". Cuando se establece una acción válida,
     * el formulario se envía automáticamente.
     */
    useEffect(() => {
        if (form.data.action) {
            sendData();
        }
    }, [form.data.action]);

    /**
     * Expone los valores y funciones necesarias para su consumo externo.
     */
    return {
        form,
        isDialogOpen,
        handleAction,
        confirmAction,
        closeDialog,
    };
}
