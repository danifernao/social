import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/kit/input-error';
import TextLink from '@/components/kit/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/kit/auth-layout';

import { SpecialPages } from '@/types/modules/page';
import { Trans, useTranslation } from 'react-i18next';

type RegisterForm = {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    language: string;
};

export default function Register() {
    const { t, i18n } = useTranslation();

    const { specialPages } = usePage<{ specialPages: SpecialPages }>().props;

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        language: i18n.language,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title={t('auth.register.title')} description={t('auth.register.description')}>
            <Head title={t('common.register')} />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="username">{t('common.username')}</Label>
                        <Input
                            id="username"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            disabled={processing}
                            placeholder={t('common.username')}
                        />
                        <InputError message={errors.username} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('common.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder={t('common.dummyEmail')}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">{t('common.password')}</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder={t('common.password')}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">{t('common.confirmPassword')}</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder={t('common.confirmPassword')}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    {(specialPages[i18n.language].policy || specialPages[i18n.language].terms) && (
                        <div className="text-muted-foreground text-center text-sm">
                            {!specialPages[i18n.language].policy && (
                                <Trans i18nKey="auth.register.disclaimer.terms">
                                    <TextLink
                                        href={route('page.show', { lang: i18n.language, slug: specialPages[i18n.language].terms?.slug })}
                                        tabIndex={6}
                                    ></TextLink>
                                </Trans>
                            )}

                            {!specialPages[i18n.language].terms && (
                                <Trans i18nKey="auth.register.disclaimer.policy">
                                    <TextLink
                                        href={route('page.show', { lang: i18n.language, slug: specialPages[i18n.language].policy?.slug })}
                                        tabIndex={6}
                                    ></TextLink>
                                </Trans>
                            )}

                            {specialPages[i18n.language].policy && specialPages[i18n.language].terms && (
                                <Trans i18nKey="auth.register.disclaimer.termsAndPolicy">
                                    <TextLink
                                        href={route('page.show', { lang: i18n.language, slug: specialPages[i18n.language].terms?.slug })}
                                        tabIndex={6}
                                    ></TextLink>
                                    <TextLink
                                        href={route('page.show', { lang: i18n.language, slug: specialPages[i18n.language].policy?.slug })}
                                        tabIndex={6}
                                    ></TextLink>
                                </Trans>
                            )}
                        </div>
                    )}

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('common.signUp')}
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    <Trans i18nKey="auth.register.alreadyHaveAccount">
                        <TextLink href={route('login')} tabIndex={6}></TextLink>
                    </Trans>
                </div>
            </form>
        </AuthLayout>
    );
}
