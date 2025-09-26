import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface ConfirmActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    password: string;
    onPasswordChange: (value: string) => void;
    onConfirm: () => void;
}

/**
 * Muestra el formulario para confirmar una acción administrativa.
 * Requiere la contraseña del usuario para continuar.
 */
export default function ConfirmActionDialog({ open, onOpenChange, password, onPasswordChange, onConfirm }: ConfirmActionDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('confirmAction')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p>{t('confirmActionDescription')}</p>
                    <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => onPasswordChange(e.target.value)} />
                </div>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={onConfirm} disabled={!password.trim()}>
                        {t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
