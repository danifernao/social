import InputError from '@/components/kit/input-error';
import TextLink from '@/components/kit/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/kit/auth-layout';
import { Auth } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Trans, useTranslation } from 'react-i18next';

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
        <AuthLayout title={t('change_email_address')} description={t('enter_new_email_for_verification_link')}>
            {/* Título del documento */}
            <Head title={t('change_email_address')} />

            {/* Formulario de cambio de correo electrónico */}
            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Campo de correo electrónico */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t('dummy_email')}
                            disabled={processing}
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Botón para confirmar el cambio */}
                    <div className="flex items-center">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {t('change')}
                        </Button>
                    </div>

                    {/* Enlace para volver a la vista de verificación de correo */}
                    <div className="text-muted-foreground space-x-1 text-center text-sm">
                        <Trans i18nKey="or_go_back_to_verification">
                            <TextLink href={route('verification.notice')}></TextLink>
                        </Trans>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
