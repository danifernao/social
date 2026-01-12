import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/kit/auth-layout';

import InputError from '@/components/kit/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Auth } from '@/types';
import { useTranslation } from 'react-i18next';

export default function ChangeEmail({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { auth } = usePage<{ auth: Auth }>().props;
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.email.update'));
    };

    return (
        <AuthLayout title={t('auth.changeEmail.title')} description={t('auth.changeEmail.description')}>
            <Head title={t('auth.changeEmail.title')} />
            <form onSubmit={submit}>
                <div className="space-y-6">
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
