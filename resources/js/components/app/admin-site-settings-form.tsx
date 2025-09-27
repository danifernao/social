import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminActionForm } from '@/hooks/app/use-admin-action-form';
import { SiteSettings } from '@/types';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import ConfirmActionDialog from './admin-confirm-action-dialog';
import FormErrors from './form-errors';

interface AdminSiteSettingsFormProps {
    settings: SiteSettings;
}

/**
 * Muestra el formulario para la gestión de la configuración del sitio.
 */
export default function AdminSiteSettingsForm({ settings }: AdminSiteSettingsFormProps) {
    const { t } = useTranslation();

    // Estado que refleja si el registro de usuarios está habilitado o no.
    const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(settings.is_user_registration_enabled);

    // Envía los datos del formulario.
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
            <FormErrors errors={form.errors} />

            {/* Habilitación / Inhabilitación de la página de registro de usuario */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('userRegistration')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <p className="text-muted-foreground text-sm italic">{t('userRegistrationVisibility')}</p>
                </CardContent>
            </Card>

            {/* Confirmación de la acción */}
            <ConfirmActionDialog
                open={isDialogOpen}
                onOpenChange={closeDialog}
                password={form.data.pass_confirmation}
                onPasswordChange={(value) => form.setData('pass_confirmation', value)}
                onConfirm={confirmAction}
            />
        </form>
    );
}
