import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import FormErrors from './form-errors';

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

    // Errores de validación.
    const [errors, setErrors] = useState<Record<string, string> | null>(null);

    // Nota obligatoria del moderador.
    const [note, setNote] = useState('');

    // Indica si se deben cerrar reportes relacionados.
    const [closeAll, setCloseAll] = useState(false);

    // Indica si el formulario se encuentra en proceso de envío.
    const [processing, setProcessing] = useState(false);

    // Cierra el reporte.
    const submit = () => {
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
                    toast.success(t('report_closed'));
                    setNote('');
                    setCloseAll(false);
                    setErrors(null);
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setErrors(errors);
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

                {/* Errores de validación */}
                <FormErrors errors={errors} />

                {/* Nota del moderador */}
                <Textarea
                    placeholder={t('resolution_note_placeholder')}
                    value={note}
                    onChange={(e) => {
                        setNote(e.target.value);
                    }}
                    required
                    maxLength={1000}
                />

                {/* Cerrar reportes relacionados */}
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={closeAll} onCheckedChange={(checked) => setCloseAll(Boolean(checked))} />
                    {t('close_related_reports')}
                </label>

                <DialogFooter>
                    {/* Botón cancelar */}
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>

                    {/* Botón para cerrar el reporte */}
                    <Button variant="destructive" onClick={submit} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('close_report')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
