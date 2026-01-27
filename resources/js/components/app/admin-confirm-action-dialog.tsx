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
 * Diálogo que muestra un formulario para confirmar una acción administrativa.
 * Requiere que el usuario ingrese su contraseña para poder continuar.
 */
export default function ConfirmActionDialog({ open, onOpenChange, password, onPasswordChange, onConfirm }: ConfirmActionDialogProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Referencia al botón de confirmación del diálogo.
    // Se utiliza para disparar programáticamente el envío del formulario.
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Gestiona el envío del formulario de confirmación.
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (password.trim()) {
            onConfirm();
        }
        e.preventDefault();
    };

    /**
     * Gestiona la pulsación de teclas dentro del campo de contraseña.
     *
     * Evita que la tecla Enter cierre el diálogo cuando el campo está vacío.
     * Si hay una contraseña válida, simula un clic en el botón de confirmación
     * para ejecutar exactamente el mismo flujo que un clic manual.
     *
     * Observación: al presionar Enter dentro del campo de contraseña, Radix
     * interpreta la acción como "interacción fuera", lo que generará comportamientos
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
                {/* Formulario de confirmación de la acción */}
                <form onSubmit={handleSubmit}>
                    {/* Cabecera del diálogo */}
                    <DialogHeader>
                        <DialogTitle>{t('confirm_action')}</DialogTitle>
                    </DialogHeader>

                    {/* Campo de contraseña */}
                    <div className="mt-4 space-y-4">
                        <p className="text-sm font-medium">{t('enter_privileged_user_password')}</p>
                        <Input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {/* Acciones del diálogo */}
                    <DialogFooter className="mt-4">
                        {/* Botón cancelar */}
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            {t('cancel')}
                        </Button>

                        {/* Botón confirmar */}
                        <Button type="submit" ref={buttonRef} disabled={!password.trim()}>
                            {t('confirm')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
