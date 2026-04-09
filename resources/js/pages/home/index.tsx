import EntryForm from '@/components/app/entry-form';
import EntryList from '@/components/app/entry-list';
import ListLoadMore from '@/components/app/list-load-more';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import { useCheckPermission } from '@/hooks/app/use-auth';
import { usePaginatedData } from '@/hooks/app/use-paginated-data';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem, Post, Posts } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Vista principal que muestra el feed de publicaciones del usuario autenticado.
 */
export default function HomeIndex() {
    // Clave en el almacenamiento local para guardar la última pestaña seleccionada.
    const storageKey = 'home:index:feed';

    // Captura la URL, el tipo de feed y la lista de publicaciones proporcionados por Inertia.
    const {
        url,
        props: { feed, posts },
    } = usePage<{
        feed: string;
        posts: Posts;
    }>();

    // Extrae la parte de búsqueda de la URL actual.
    const search = url.includes('?') ? url.split('?')[1] : '';

    // Determina si la URL actual contiene el parámetro 'feed'.
    const hasFeedParam = new URLSearchParams(search).has('feed');

    // Recupera la última pestaña seleccionada del almacenamiento local.
    const storedFeed = localStorage.getItem(storageKey);

    // Si no hay un parámetro 'feed' en la URL pero sí una pestaña almacenada, navega a esa pestaña.
    if (!hasFeedParam && storedFeed && storedFeed !== feed) {
        router.get(route('home.index'), { feed: storedFeed }, { preserveScroll: true });
        return null;
    }

    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Usa el hook de paginación para gestionar el feed de publicaciones.
    const {
        items: entries, // Lista actual de publicaciones visibles.
        nextCursor, // Cursor para solicitar la siguiente página de publicaciones.
        processing, // Indica si se está cargando más contenido.
        loadMore, // Función para cargar más publicaciones.
        applyItemChange, // Función para sincronizar cambios en el listado.
    } = usePaginatedData<Post>({
        initialItems: posts.data, // Publicaciones iniciales cargadas desde el servidor.
        initialCursor: posts.meta.next_cursor, // Cursor inicial de paginación.
        propKey: 'posts', // Propiedad de la respuesta de Inertia que contiene los datos.
        insertAtStart: true, // Indica que los nuevos elementos deben agregarse al inicio de la lista.
    });

    // Maneja el cambio de pestaña.
    const handleChange = (value: string) => {
        localStorage.setItem(storageKey, value);
        router.get(route('home.index'), { feed: value }, { preserveScroll: true });
    };

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('home'),
            href: route('home.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('home')} />

            <AppContentLayout>
                {/* Contexto para sincronizar cambios en el feed de publicaciones */}
                <EntryListUpdateContext.Provider value={applyItemChange}>
                    {/* Formulario para crear una nueva publicación */}
                    {useCheckPermission('post') && <EntryForm />}

                    {/* Pestañas */}
                    <Tabs value={feed} onValueChange={handleChange}>
                        <TabsList>
                            <TabsTrigger value="all">{t('global')}</TabsTrigger>
                            <TabsTrigger value="following">{t('following')}</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Listado de publicaciones del feed */}
                    <EntryList entries={entries} />
                </EntryListUpdateContext.Provider>

                {/* Botón para cargar más publicaciones */}
                <ListLoadMore type="post" cursor={nextCursor} isProcessing={processing} onClick={loadMore} />
            </AppContentLayout>
        </AppLayout>
    );
}
