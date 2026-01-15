import InputError from '@/components/kit/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/kit/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Vista que solicita al usuario confirmar su contraseña
 * antes de realizar acciones sensibles.
 */
export default function ConfirmPassword() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Inicializa el formulario de confirmación de contraseña.
    const { data, setData, post, processing, errors, reset } = useForm<Required<{ password: string }>>({
        password: '',
    });

    // Gestiona el envío del formulario de confirmación de contraseña.
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            // Limpia el campo de contraseña una vez finalizada la petición.
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title={t('auth.confirmPassword.title')} description={t('auth.confirmPassword.description')}>
            {/* Título del documento */}
            <Head title={t('auth.confirmPassword.title')} />

            {/* Formulario de confirmación de contraseña */}
            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Campo de contraseña */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">{t('common.password')}</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            placeholder={t('common.password')}
                            autoComplete="current-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Botón para confirmar la contraseña */}
                    <div className="flex items-center">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {t('common.confirmPassword')}
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
