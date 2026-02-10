import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { SubmitEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import FormErrors from './form-errors';

/**
 * Formulario para la creación de un nuevo usuario.
 */
export default function AdminUserCreateForm() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Inicializa el formulario de creación de usuario.
    const form = useForm({
        email: '',
        privileged_password: '',
    });

    // Gestiona el envío del formulario.
    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        form.post(route('admin.user.store'));
        e.preventDefault();
    };

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            <Card className="gap-4">
                <CardHeader>
                    {/* Título y descripción del formulario */}
                    <CardTitle>{t('create_user')}</CardTitle>
                    <CardDescription>{t('fill_fields_to_register_user')}</CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Errores de validación del formulario */}
                    <FormErrors errors={form.errors} />

                    {/* Campo de correo electrónico */}
                    <div className="space-y-2 py-4">
                        <label className="block text-sm font-medium">{t('email')}</label>
                        <Input
                            type="email"
                            placeholder={t('email')}
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            disabled={form.processing}
                        />
                        <p className="text-muted-foreground text-sm italic">{t('password_setup_link_will_be_sent')}</p>
                    </div>

                    {/* Campo de contraseña para confirmar la acción */}
                    <div className="space-y-2 py-4">
                        <label className="block text-sm font-medium">{t('confirm_action')}</label>
                        <p className="text-sm font-medium">{t('enter_privileged_user_password')}</p>
                        <Input
                            type="password"
                            placeholder={t('password')}
                            value={form.data.privileged_password}
                            onChange={(e) => form.setData('privileged_password', e.target.value)}
                            disabled={form.processing}
                        />
                    </div>

                    {/* Botón de envío */}
                    <Button
                        type="submit"
                        disabled={form.processing || form.data.email.trim().length === 0 || form.data.privileged_password.trim().length === 0}
                        className="mt-4 flex items-center justify-center gap-2"
                    >
                        {form.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('create')}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}
