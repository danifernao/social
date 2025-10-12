import { Button } from '@/components/ui/button';
import { SiteSettings } from '@/types';
import { SpecialPages } from '@/types/modules/page';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Welcome() {
    // Obtiene las traducciones de la página.
    const { t, i18n } = useTranslation();

    // Captura la configuración del sitio proporcionado por Inertia.
    const { specialPages, siteSettings } = usePage<{ specialPages: SpecialPages; siteSettings: SiteSettings }>().props;

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <Head title={t('welcome')} />

                <h1 className="mb-4 text-4xl font-bold md:text-6xl">{t('welcomeTitle', { siteName: 'Social' })}</h1>

                <p className="mb-8 max-w-2xl text-lg md:text-xl">{t('welcomeMessage')}</p>

                {/* Botones de inicio de sesión y registro */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <Link href="/login">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                            {t('login')}
                        </Button>
                    </Link>
                    {siteSettings.is_user_registration_enabled && (
                        <Link href="/register">
                            <Button size="lg" className="w-full sm:w-auto">
                                {t('signUp')}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {(specialPages[i18n.language].about || specialPages[i18n.language].terms || specialPages[i18n.language].policy) && (
                <div className="text-muted-foreground flex justify-end gap-4 p-6 text-right text-sm">
                    {/* Enlace de acerca de */}
                    {specialPages[i18n.language].about && (
                        <Link
                            href={route('page.show', { lang: i18n.language, slug: specialPages[i18n.language].about?.slug })}
                            className="hover:underline"
                        >
                            {t('pageTypes.about')}
                        </Link>
                    )}

                    {/* Enlace de términos y condiciones */}
                    {specialPages[i18n.language].terms && (
                        <Link
                            href={route('page.show', { lang: i18n.language, slug: specialPages[i18n.language].terms?.slug })}
                            className="hover:underline"
                        >
                            {t('pageTypes.terms')}
                        </Link>
                    )}

                    {/* Enlace de política de privacidad */}
                    {specialPages[i18n.language].policy && (
                        <Link
                            href={route('page.show', { lang: i18n.language, slug: specialPages[i18n.language].policy?.slug })}
                            className="hover:underline"
                        >
                            {t('pageTypes.policy')}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
