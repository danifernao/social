import FormattedText from '@/components/app/formatted-text';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Page } from '@/types/modules/page';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Muestra la página de perfil de un usuario.
 */
export default function PagesShow() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura los datos de la página actual proporcionados por Inertia.
    const { page } = usePage<{ page: Page }>().props;

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: page.title,
            href: route('page.show', { lang: page.language, slug: page.slug }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={page.title} />
            <AppContentLayout>
                <h1 className="text-3xl">{page.title}</h1>
                <FormattedText entryType="page" text={page.content || ''} />
            </AppContentLayout>
        </AppLayout>
    );
}
