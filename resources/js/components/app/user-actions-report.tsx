import { User } from '@/types';
import { Flag } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import ReportDialog from './report-dialog';

interface UserActionsReportProps {
    user: User; // El usuario que se reportará.
    onDialogClose: () => void; // Callback que se dispara al cerrarse el diálogo.
}

/**
 * Botón para reportar a un usuario.
 */
export default function UserActionsReport({ user, onDialogClose }: UserActionsReportProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Controla la visibilidad del diálogo para reportar la entrada.
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

    return (
        <>
            {/* Botón reportar */}
            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsReportDialogOpen(true)}>
                <Flag className="h-4 w-4" />
                <span>{t('report')}</span>
            </Button>

            {/* Diálogo para reportar al usuario */}
            <ReportDialog
                open={isReportDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        onDialogClose();
                    }
                    setIsReportDialogOpen(open);
                }}
                reportableType="user"
                reportableId={user.id}
            />
        </>
    );
}
