import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import FormErrors from './form-errors';

interface ReportDialogProps {
    // Controla si el diálogo está abierto.
    open: boolean;

    // Callback para abrir o cerrar el diálogo.
    onOpenChange: (open: boolean) => void;

    // Tipo de contenido que se va a reportar.
    reportableType: 'post' | 'comment' | 'user';

    // ID del contenido que se va a reportar.
    reportableId: number;
}

/**
 * Diálogo para crear un reporte sobre una publicación, comentario o usuario.
 */
export default function ReportDialog({ open, onOpenChange, reportableType, reportableId }: ReportDialogProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Errores de validación.
    const [errors, setErrors] = useState<Record<string, string> | null>(null);

    // Nota opcional ingresada por el usuario.
    const [note, setNote] = useState('');

    // Indica si el formulario se encuentra en proceso de envío.
    const [processing, setProcessing] = useState(false);

    // Envía el reporte.
    const submit = () => {
        setProcessing(true);

        router.post(
            route('report.store'),
            {
                reportable_type: reportableType,
                reportable_id: reportableId,
                reporter_note: note || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('report_sent'));
                    setNote('');
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
                    <DialogTitle>{t('report')}</DialogTitle>
                    <DialogDescription>{t('report_description')}</DialogDescription>
                </DialogHeader>

                {/* Errores de validación */}
                <FormErrors errors={errors} />

                {/* Campo para la nota opcional del reporte */}
                <Textarea placeholder={t('report_optional_note')} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />

                <DialogFooter>
                    {/* Botón cancelar */}
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>

                    {/* Botón de envío */}
                    <Button variant="destructive" onClick={submit} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('report')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
