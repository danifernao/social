import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface NotificationHeaderProps {
    markAsRead: () => void; // Función que marca todas las notificaciones como leídas.
    isProcessing: boolean; // Indica si la acción de marcar como leídas está en proceso.
}

/**
 * Encabezado de la vista de notificaciones. Incluye el título de la sección
 * y un botón que permite marcar todas las notificaciones como leídas
 */
export default function NotificationHeader({ markAsRead, isProcessing }: NotificationHeaderProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-4">
            {/* Título principal de la sección de notificaciones */}
            <h2 className="flex-1 text-2xl font-bold">{t('notifications')}</h2>

            <div>
                {/* Botón para marcar todas las notificaciones como leídas */}
                <Button onClick={markAsRead} disabled={isProcessing}>
                    {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />} {t('mark_as_read')}
                </Button>
            </div>
        </div>
    );
}
