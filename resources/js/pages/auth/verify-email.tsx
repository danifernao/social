// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/kit/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/kit/auth-layout';

import { useTranslation } from 'react-i18next';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation();

    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout title={t('verifyEmail')} description={t('verifyEmailMessage')}>
            <Head title={t('verifyEmail')} />

            {status === 'verification_link_sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">{t('verificationEmailSent')}</div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {t('resendVerificationEmail')}
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    {t('logout')}
                </TextLink>
            </form>
        </AuthLayout>
    );
}
