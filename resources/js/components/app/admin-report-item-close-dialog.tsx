import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface AdminReportItemCloseDialogProps {
    // Controla si el diálogo está abierto.
    open: boolean;

    // Callback para abrir o cerrar el diálogo.
    onOpenChange: (open: boolean) => void;

    // ID del reporte.
    reportId: number;
}

/**
 * Diálogo para cerrar un reporte administrativo.
 */
export default function AdminReportItemCloseDialog({ open, onOpenChange, reportId }: AdminReportItemCloseDialogProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Nota obligatoria del moderador.
    const [note, setNote] = useState('');

    // Indica si se deben cerrar reportes relacionados.
    const [closeAll, setCloseAll] = useState(false);

    // Mensaje de error para la nota del moderador.
    const [noteError, setNoteError] = useState<string | null>(null);

    // Indica si el formulario se encuentra en proceso de envío.
    const [processing, setProcessing] = useState(false);

    // Cierra el reporte.
    const submit = () => {
        if (!note.trim()) {
            setNoteError(t('resolution_note_required'));
            return;
        }

        setNoteError(null);
        setProcessing(true);

        router.patch(
            route('admin.report.update', reportId),
            {
                resolver_note: note,
                all: closeAll,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast(t('report_closed'));
                    setNote('');
                    setCloseAll(false);
                    onOpenChange(false);
                },
                onError: () => {
                    toast(t('unexpected_error'));
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('close_report')}</DialogTitle>
                    <DialogDescription>{t('confirm_close_report_irreversible')}</DialogDescription>
                </DialogHeader>

                {/* Nota del moderador */}
                <Textarea
                    placeholder={t('resolution_note_placeholder')}
                    value={note}
                    onChange={(e) => {
                        setNote(e.target.value);
                        if (noteError) {
                            setNoteError(null);
                        }
                    }}
                    required
                    maxLength={1000}
                />

                {noteError && <p className="text-destructive-foreground text-sm">{noteError}</p>}

                {/* Cerrar reportes relacionados */}
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={closeAll} onCheckedChange={(checked) => setCloseAll(Boolean(checked))} />
                    {t('close_related_reports')}
                </label>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>

                    <Button variant="destructive" onClick={submit} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('close_report')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
