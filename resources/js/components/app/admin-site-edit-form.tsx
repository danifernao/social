import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminActionForm } from '@/hooks/app/use-admin-action-form';
import { SiteSettings } from '@/types';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import ConfirmActionDialog from './admin-confirm-action-dialog';
import FormErrors from './form-errors';

interface AdminSiteEditFormProps {
    settings: SiteSettings; // Configuración del sitio.
}

/**
 * Formulario para la gestión de la configuración del sitio.
 */
export default function AdminSiteEditForm({ settings }: AdminSiteEditFormProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Estado que refleja si el registro de usuarios está habilitado o no.
    const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(settings.is_user_registration_enabled);

    // Inicializa y gestiona el formulario de configuración del sitio.
    const { form, handleAction, confirmAction, isDialogOpen, closeDialog } = useAdminActionForm({
        initialData: {},
        route: () => route('admin.site.update'),
        onSuccess: (action) => {
            switch (action) {
                case 'toggle_user_registration':
                    setIsRegistrationEnabled((prev) => !prev);
                    break;
            }
        },
    });

    return (
        <form className="space-y-8">
            {/* Habilitación / inhabilitación del registro de usuarios */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('user_registration')}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Errores de la acción */}
                    {form.data.action === 'toggle_user_registration' && <FormErrors errors={form.errors} />}

                    {/* Selector de estado del registro de usuarios */}
                    <div className="flex items-center gap-2">
                        <ToggleGroup
                            type="single"
                            value={String(isRegistrationEnabled)}
                            onValueChange={(value) => {
                                if (value) {
                                    handleAction('toggle_user_registration');
                                }
                            }}
                            variant="outline"
                            disabled={form.processing && form.data.action === 'toggle_user_registration'}
                        >
                            <ToggleGroupItem value="true">{t('enabled')}</ToggleGroupItem>
                            <ToggleGroupItem value="false">{t('disabled')}</ToggleGroupItem>
                        </ToggleGroup>

                        {form.processing && form.data.action === 'toggle_user_registration' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    </div>

                    {/* Descripción de la acción */}
                    <p className="text-muted-foreground text-sm italic">{t('toggle_user_registration')}</p>
                </CardContent>
            </Card>

            {/* Confirmación de la acción */}
            <ConfirmActionDialog
                open={isDialogOpen}
                onOpenChange={closeDialog}
                password={form.data.privileged_password}
                onPasswordChange={(value) => form.setData('privileged_password', value)}
                onConfirm={confirmAction}
            />
        </form>
    );
}
