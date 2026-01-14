import { Button } from '@/components/ui/button';
import { SiteSettings } from '@/types';
import { SpecialPages } from '@/types/modules/page';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Vista de inicio pública de la aplicación.
 */
export default function Welcome() {
    // Función para traducir los textos de la interfaz
    // y acceso al idioma actualmente activo.
    const { t, i18n } = useTranslation();

    // Captura las páginas especiales y la configuración del sitio
    // proporcionadas por Inertia.
    const { specialPages, siteSettings } = usePage<{ specialPages: SpecialPages; siteSettings: SiteSettings }>().props;

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                {/* Título del documento */}
                <Head title={t('welcome.layout.title')} />

                {/* Título principal de bienvenida */}
                <h1 className="mb-4 text-4xl font-bold md:text-6xl">{t('welcome.title', { siteName: 'Social' })}</h1>

                {/* Descripción principal de la aplicación */}
                <p className="mb-8 max-w-2xl text-lg md:text-xl">{t('welcome.description')}</p>

                {/* Botones de inicio de sesión y registro */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <Link href="/login">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                            {t('common.login')}
                        </Button>
                    </Link>
                    {siteSettings.is_user_registration_enabled && (
                        <Link href="/register">
                            <Button size="lg" className="w-full sm:w-auto">
                                {t('common.register')}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Enlaces a páginas legales o informativas */}
            {(specialPages[i18n.currentLang].about || specialPages[i18n.currentLang].terms || specialPages[i18n.currentLang].policy) && (
                <div className="text-muted-foreground flex justify-end gap-4 p-6 text-right text-sm">
                    {/* Enlace de acerca de */}
                    {specialPages[i18n.currentLang].about && (
                        <Link
                            href={route('page.show', { lang: i18n.currentLang, slug: specialPages[i18n.currentLang].about?.slug })}
                            className="hover:underline"
                        >
                            {t('page.types.about')}
                        </Link>
                    )}

                    {/* Enlace de términos y condiciones */}
                    {specialPages[i18n.currentLang].terms && (
                        <Link
                            href={route('page.show', { lang: i18n.currentLang, slug: specialPages[i18n.currentLang].terms?.slug })}
                            className="hover:underline"
                        >
                            {t('page.types.terms')}
                        </Link>
                    )}

                    {/* Enlace de política de privacidad */}
                    {specialPages[i18n.currentLang].policy && (
                        <Link
                            href={route('page.show', { lang: i18n.currentLang, slug: specialPages[i18n.currentLang].policy?.slug })}
                            className="hover:underline"
                        >
                            {t('page.types.policy')}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
