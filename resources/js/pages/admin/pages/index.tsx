import AdminPageList from '@/components/app/admin-page-list';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/app/admin/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Locale } from '@/types/modules/locale';
import { Pages } from '@/types/modules/page';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * Vista de administración que muestra el listado de páginas estáticas.
 */
export default function PagesIndex() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura un mensaje informativo, los idiomas disponibles,
    // la página estática y el idioma actualmente seleccionado
    // proporcionados por Inertia.
    const {
        message,
        locales,
        pages,
        language: currentLanguage,
    } = usePage<{ message: string; locales: Locale[]; pages: Pages; language: string }>().props;

    // Cambia el idioma de consulta de páginas estáticas.
    const handleLanguageChange = (lang: string) => {
        router.get(route('admin.page.index'), { lang }, { preserveState: true, preserveScroll: true });
    };

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('admin.page.layout.title'),
            href: route('admin.page.index', { lang: currentLanguage }),
        },
    ];

    useEffect(() => {
        // Si se ha proporcionado un mensaje, lo muestra.
        if (message) {
            toast(message);
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('admin.page.layout.title')} />

            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <div className="flex items-center justify-between">
                        {/* Enlace para crear una nueva página estática */}
                        <Button variant="outline" asChild>
                            <Link href={route('admin.page.create', { lang: currentLanguage })}>{t('admin.page.index.create.title')}</Link>
                        </Button>

                        {/* Selector de idioma */}
                        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder={t('common.selectLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
                                {locales.map(({ lang, label }) => (
                                    <SelectItem key={lang} value={lang}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Listado de páginas estáticas */}
                    <AdminPageList pages={pages.data} previous={pages.links.prev} next={pages.links.next} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
