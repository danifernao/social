import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface NotificationHeaderProps {
    markAsRead: () => void; // Función que marca todas las notificaciones como leídas.
    isProcessing: boolean; // Indica si la acción de marcar como leídas está en proceso.
}

/**
 * Muestra el encabezado de la página de notificaciones y un botón para marcarlas como leídas.
 */
export default function NotificationHeader({ markAsRead, isProcessing }: NotificationHeaderProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-4">
            <h2 className="flex-1 text-2xl font-bold">{t('notifications')}</h2>
            <div>
                <Button onClick={markAsRead} disabled={isProcessing}>
                    {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />} {t('markAsRead')}
                </Button>
            </div>
        </div>
    );
}
