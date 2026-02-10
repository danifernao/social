import { Report } from '@/types/modules/report';
import { MessageSquareOff, MessageSquareText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface AdminReportNoteProps {
    report: Report;
    userType: 'reporter' | 'resolver';
}

/**
 * Botón y diálogo para ver la nota agregada en los reportes.
 */
export default function AdminReportNote({ report, userType }: AdminReportNoteProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Determina si el tipo de usuario corresponde a quien realizó el reporte.
    const isReporter = userType === 'reporter';

    // Determina la fuente de la información según el tipo de usuario.
    // Si el tipo de usuario es "reporter", se toman los datos del usuario que creó el reporte.
    // En caso contrario, se toman los datos del usuario que cerró el reporte.
    const source = isReporter
        ? {
              note: report.reporter_note,
              user: report.reporter,
              userId: report.reporter_id,
          }
        : {
              note: report.resolver_note,
              user: report.resolver,
              userId: report.resolver_id,
          };

    // Descripción del diálogo.
    const description = source.user ? t('user_left_note', { username: source.user.username }) : t('deleted_user_left_note', { id: source.userId });

    return (
        <>
            {source.note ? (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" title={t('view_note')} aria-label={t('view_note')}>
                            <MessageSquareText className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('note')}</DialogTitle>
                            <DialogDescription>{description}</DialogDescription>
                        </DialogHeader>
                        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4 text-sm">{source.note}</div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">{t('close')}</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : (
                <div className="text-muted flex items-center justify-center" aria-label={t('note_not_added')}>
                    <MessageSquareOff className="h-4 w-4" />
                </div>
            )}
        </>
    );
}
