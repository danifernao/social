import InputError from '@/components/kit/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/kit/auth-layout';
import { Auth } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Vista que permite al usuario cambiar su dirección
 * de correo electrónico antes de la verificación del mismo.
 */
export default function ChangeEmail({ status }: { status?: string }) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    // Inicializa el formulario de cambio de correo electrónico.
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: auth.user.email,
    });

    // Gestiona el envío del formulario de cambio de correo electrónico.
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.email.update'));
    };

    return (
        <AuthLayout title={t('auth.changeEmail.title')} description={t('auth.changeEmail.description')}>
            {/* Título del documento */}
            <Head title={t('auth.changeEmail.title')} />

            {/* Formulario de cambio de correo electrónico */}
            <form onSubmit={submit}>
                <div className="space-y-6">
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
                            disabled={processing}
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Botón para confirmar el cambio */}
                    <div className="flex items-center">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {t('common.change')}
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
