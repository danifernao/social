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
        <AuthLayout title={t('auth.verifyEmail.title')} description={t('auth.verifyEmail.description')}>
            <Head title={t('auth.verifyEmail.title')} />

            {status === 'verification_link_sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">{t('auth.verifyEmail.emailSent')}</div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {t('auth.verifyEmail.resendEmail')}
                </Button>
                <div className="mx-auto text-center">
                    <TextLink href={route('verification.email.edit')} className="text-sm">
                        {t('auth.changeEmail.link')}
                    </TextLink>
                    <span className="mx-2">|</span>
                    <TextLink href={route('logout')} method="post" className="text-sm">
                        {t('common.logout')}
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
