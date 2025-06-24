import EntryForm from '@/components/content/entry-form';
import EntryList from '@/components/content/entry-list';
import ListLoadMore from '@/components/content/list-load-more';
import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import { usePaginatedData } from '@/hooks/use-paginated-data';
import AppLayout from '@/layouts/app-layout';
import { AppContentLayout } from '@/layouts/app/app-content-layout';
import type { BreadcrumbItem, Post, Posts } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Muestra la página de inicio del usuario autenticado.
 */
export default function Home() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation('common');

    // Captura la lista de publicaciones proporcionada por Inertia.
    const { posts } = usePage<{ posts: Posts }>().props;

    // Usa el hook de paginación para gestionar la lista de publicaciones.
    const {
        items: entries, // Lista de publicaciones actuales.
        cursor, // Cursor para la siguiente página de publicaciones.
        processing, // Indica si se está cargando más publicaciones.
        loadMore, // Función para cargar más publicaciones.
        handleEntryChanges, // Función para actualizar la lista de publicaciones.
    } = usePaginatedData<Post>({
        initialItems: posts.data, // Lista inicial de publicaciones.
        initialCursor: posts.meta.next_cursor, // Cursor inicial.
        fetchUrl: route('home.show'), // Ruta para solicitar más publicaciones.
        propKey: 'posts', // Nombre de la propiedad que devuelve Inertia con los datos a usar.
    });

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('home'),
            href: route('home.show'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('home')} />
            <AppContentLayout>
                <EntryListUpdateContext.Provider value={handleEntryChanges}>
                    <EntryForm />
                    <EntryList entries={entries} />
                </EntryListUpdateContext.Provider>
                <ListLoadMore type="post" cursor={cursor} isProcessing={processing} onClick={loadMore} />
            </AppContentLayout>
        </AppLayout>
    );
}
