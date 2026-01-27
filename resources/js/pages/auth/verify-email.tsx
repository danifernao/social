import TextLink from '@/components/kit/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/kit/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Vista que solicita al usuario verificar su dirección
 * de correo electrónico y permite reenviar el enlace.
 */
export default function VerifyEmail({ status }: { status?: string }) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Inicializa el formulario para reenviar el correo de verificación.
    const { post, processing } = useForm({});

    // Gestiona el envío de la solicitud para reenviar el enlace de verificación.
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout title={t('verify_email')} description={t('verify_your_email_using_sent_link')}>
            {/* Título del documento */}
            <Head title={t('verify_email')} />

            {/* Mensaje de confirmación cuando el enlace ha sido enviado */}
            {status === 'verification_link_sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">{t('new_verification_link_sent')}</div>
            )}

            {/* Formulario para reenviar el correo de verificación */}
            <form onSubmit={submit} className="space-y-6 text-center">
                {/* Botón para reenviar el correo */}
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {t('resend_verification_email')}
                </Button>

                {/* Acciones secundarias: cambiar correo o cerrar sesión */}
                <div className="mx-auto text-center">
                    <TextLink href={route('verification.email.edit')} className="text-sm">
                        {t('change_email_address')}
                    </TextLink>
                    <span className="mx-2">|</span>
                    <TextLink href={route('logout')} method="post" className="text-sm">
                        {t('logout')}
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
