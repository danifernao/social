import EntryForm from '@/components/app/entries/form';
import EntryList from '@/components/app/entries/list';
import ListLoadMore from '@/components/app/shared/list-load-more';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostListUpdateContext } from '@/contexts/list-update-context';
import { usePaginatedData } from '@/hooks/app/use-paginated-data';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import { hasPermission } from '@/lib/utils';
import type { Auth, BreadcrumbItem, Post, Posts } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Vista principal que muestra el feed de publicaciones del usuario autenticado.
 */
export default function HomeIndex() {
    // Captura la URL, el tipo de feed y la lista de publicaciones proporcionados por Inertia.
    const { auth, feed, posts } = usePage<{
        auth: Auth;
        feed: string;
        posts: Posts;
    }>().props;

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
                <PostListUpdateContext.Provider value={applyItemChange}>
                    {/* Formulario para crear una nueva publicación */}
                    {hasPermission(auth, 'post') && <EntryForm />}

                    {/* Pestañas */}
                    <Tabs value={feed} onValueChange={handleChange}>
                        <TabsList>
                            <TabsTrigger value="all">{t('global')}</TabsTrigger>
                            <TabsTrigger value="following">{t('following')}</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Listado de publicaciones del feed */}
                    <EntryList entries={entries} />
                </PostListUpdateContext.Provider>

                {/* Botón para cargar más publicaciones */}
                <ListLoadMore type="post" cursor={nextCursor} isProcessing={processing} onClick={loadMore} />
            </AppContentLayout>
        </AppLayout>
    );
}
