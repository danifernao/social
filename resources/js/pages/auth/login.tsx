import InputError from '@/components/kit/input-error';
import TextLink from '@/components/kit/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/kit/auth-layout';
import { SiteSettings } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Trans, useTranslation } from 'react-i18next';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

/**
 * Vista de autenticación que permite al usuario iniciar sesión en la aplicación.
 */
export default function Login({ status, canResetPassword }: LoginProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura la configuración global del sitio proporcionada por Inertia.
    const { siteSettings } = usePage<{ siteSettings: SiteSettings }>().props;

    // Inicializa el formulario de inicio de sesión.
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    // Gestiona el envío del formulario de inicio de sesión.
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            // Limpia el campo de contraseña una vez finalizada la petición.
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title={t('auth.login.title')} description={t('auth.login.description')}>
            {/* Título del documento */}
            <Head title={t('common.login')} />

            {/* Formulario de inicio de sesión */}
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    {/* Campo de correo electrónico */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('common.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t('common.dummyEmail')}
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Campo de contraseña */}
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">{t('common.password')}</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    {t('auth.login.forgotPassword')}
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={t('common.password')}
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Opción para recordar la sesión */}
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">{t('common.rememberMe')}</Label>
                    </div>

                    {/* Botón de envío del formulario */}
                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('common.login')}
                    </Button>
                </div>

                {/* Enlace para registro si la creación de usuarios está habilitada */}
                {siteSettings.is_user_registration_enabled && (
                    <div className="text-muted-foreground text-center text-sm">
                        <Trans i18nKey="auth.login.noAccountYet">
                            <TextLink href={route('register')} tabIndex={5}></TextLink>
                        </Trans>
                    </div>
                )}
            </form>

            {/* Mensaje de estado mostrado después de ciertas acciones */}
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
