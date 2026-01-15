import InputError from '@/components/kit/input-error';
import TextLink from '@/components/kit/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/kit/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Trans, useTranslation } from 'react-i18next';

/**
 * Vista que permite al usuario solicitar un correo para restablecer su contraseña.
 */
export default function ForgotPassword({ status }: { status?: string }) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Inicializa el formulario para la solicitud de restablecimiento.
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    // Gestiona el envío del formulario de recuperación de contraseña.
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout title={t('auth.forgotPassword.title')} description={t('auth.forgotPassword.description')}>
            {/* Título del documento */}
            <Head title={t('auth.forgotPassword.title')} />

            {/* Mensaje de estado mostrado después de la acción */}
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="space-y-6">
                {/* Formulario para solicitar el enlace de recuperación */}
                <form onSubmit={submit}>
                    {/* Campo de correo electrónico */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('common.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t('common.dummyEmail')}
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Botón de envío del formulario */}
                    <div className="my-6 flex items-center justify-start">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {t('auth.forgotPassword.sendEmail')}
                        </Button>
                    </div>
                </form>

                {/* Enlace para volver a la pantalla de inicio de sesión */}
                <div className="text-muted-foreground space-x-1 text-center text-sm">
                    <Trans i18nKey="auth.forgotPassword.returnToLogin">
                        <TextLink href={route('login')}></TextLink>
                    </Trans>
                </div>
            </div>
        </AuthLayout>
    );
}
