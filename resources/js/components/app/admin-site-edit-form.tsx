import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteSettings } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
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

    // Inicializa el formulario de Inertia.
    const form = useForm({
        action: '',
    });

    // Registra una acción administrativa pendiente.
    const handleAction = (action: string) => {
        form.setData('action', action);
    };

    // Envía la acción administrativa.
    const sendForm = () => {
        form.patch(route('admin.site.update'), {
            preserveScroll: true,
            onSuccess: () => {
                if (form.data.action === 'toggle_user_registration') {
                    setIsRegistrationEnabled((prev) => !prev);
                }

                toast.success(t('changes_saved'));
            },
            onError: (errors) => {
                toast.error(t('unexpected_error'));

                if (import.meta.env.DEV) {
                    console.error(errors);
                }
            },
        });
    };

    useEffect(() => {
        if (form.data.action) {
            sendForm();
        }
    }, [form.data.action]);

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

                    {/* Enlace para crear o gestionar enlaces de invitación */}
                    {!isRegistrationEnabled && (
                        <Link href={route('admin.invitation.index')} className="text-sm text-blue-600 hover:underline">
                            {t('click_here_to_create_and_manage_invite_links')}
                        </Link>
                    )}
                </CardContent>
            </Card>
        </form>
    );
}
