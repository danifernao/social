import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRef } from 'react';
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
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Referencia al botón de confirmación del diálogo.
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Envía la contraseña.
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (password.trim()) {
            onConfirm();
        }
        e.preventDefault();
    };

    /**
     * Evita que Enter cierre el diálogo si el campo de texto está vacío.
     * De lo contrario, lo envía.
     *
     * Observación: al presionar Enter dentro del campo de texto, Radix interpreta
     * la acción como "interacción fuera", lo que generará comportamientos
     * inesperados en el hook que gestiona las acciones administrativas.
     *
     * Solución: si hay contraseña, se simula un clic en el botón de confirmación
     * para disparar el mismo flujo que un clic manual; siempre se hace
     * preventDefault para evitar cierres inesperados.
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (password.trim()) {
                buttonRef.current?.click();
            }
            e.preventDefault();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t('confirmAction')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>{t('confirmActionDescription')}</p>
                        <Input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            {t('cancel')}
                        </Button>
                        <Button type="submit" ref={buttonRef} disabled={!password.trim()}>
                            {t('confirm')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
