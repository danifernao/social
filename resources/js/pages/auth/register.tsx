import InputError from '@/components/kit/input-error';
import TextLink from '@/components/kit/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/kit/auth-layout';
import { SpecialPages } from '@/types/modules/page';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Trans, useTranslation } from 'react-i18next';

type RegisterForm = {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    language: string;
};

/**
 * Vista de registro que permite crear una nueva cuenta de usuario en la aplicación.
 */
export default function Register() {
    // Funciones de traducción y acceso al idioma actual.
    const { t, i18n } = useTranslation();

    // Obtiene las páginas estáticas especiales (términos y política)
    // compartidas por Inertia.
    const { specialPages } = usePage<{ specialPages: SpecialPages }>().props;

    // Inicializa el formulario de registro de usuario.
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        language: i18n.currentLang,
    });

    // Gestiona el envío del formulario de registro.
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            // Limpia los campos sensibles una vez finalizada la petición.
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title={t('auth.register.title')} description={t('auth.register.description')}>
            {/* Título del documento */}
            <Head title={t('common.register')} />

            {/* Formulario de registro */}
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    {/* Campo de nombre de usuario */}
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

                    {/* Campo de correo electrónico */}
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

                    {/* Campo de contraseña */}
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

                    {/* Campo de confirmación de contraseña */}
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

                    {/* Aviso legal con enlaces a términos y/o política de privacidad */}
                    {(specialPages[i18n.currentLang].policy || specialPages[i18n.currentLang].terms) && (
                        <div className="text-muted-foreground text-center text-sm">
                            {/* Solo términos */}
                            {!specialPages[i18n.currentLang].policy && (
                                <Trans i18nKey="auth.register.disclaimer.terms">
                                    <TextLink
                                        href={route('page.show', {
                                            lang: i18n.currentLang,
                                            slug: specialPages[i18n.currentLang].terms?.slug,
                                        })}
                                        tabIndex={6}
                                    ></TextLink>
                                </Trans>
                            )}

                            {/* Solo política de privacidad */}
                            {!specialPages[i18n.currentLang].terms && (
                                <Trans i18nKey="auth.register.disclaimer.policy">
                                    <TextLink
                                        href={route('page.show', {
                                            lang: i18n.currentLang,
                                            slug: specialPages[i18n.currentLang].policy?.slug,
                                        })}
                                        tabIndex={6}
                                    ></TextLink>
                                </Trans>
                            )}

                            {/* Términos y política disponibles */}
                            {specialPages[i18n.currentLang].policy && specialPages[i18n.currentLang].terms && (
                                <Trans i18nKey="auth.register.disclaimer.termsAndPolicy">
                                    <TextLink
                                        href={route('page.show', {
                                            lang: i18n.currentLang,
                                            slug: specialPages[i18n.currentLang].terms?.slug,
                                        })}
                                        tabIndex={6}
                                    ></TextLink>
                                    <TextLink
                                        href={route('page.show', {
                                            lang: i18n.currentLang,
                                            slug: specialPages[i18n.currentLang].policy?.slug,
                                        })}
                                        tabIndex={6}
                                    ></TextLink>
                                </Trans>
                            )}
                        </div>
                    )}

                    {/* Botón de envío del formulario */}
                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('common.signUp')}
                    </Button>
                </div>

                {/* Enlace para usuarios que ya tienen cuenta */}
                <div className="text-muted-foreground text-center text-sm">
                    <Trans i18nKey="auth.register.alreadyHaveAccount">
                        <TextLink href={route('login')} tabIndex={6}></TextLink>
                    </Trans>
                </div>
            </form>
        </AuthLayout>
    );
}
