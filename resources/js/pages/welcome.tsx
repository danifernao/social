import { Button } from '@/components/ui/button';
import { SiteSettings } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Welcome() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura la configuración del sitio proporcionado por Inertia.
    const { siteSettings } = usePage<{ siteSettings: SiteSettings }>().props;

    return (
        <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6 text-center">
            <Head title={t('welcome')} />
            <h1 className="mb-4 text-4xl font-bold md:text-6xl">{t('welcomeTitle', { siteName: 'Social' })}</h1>
            <p className="mb-8 max-w-2xl text-lg md:text-xl">{t('welcomeMessage')}</p>
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
    );
}
