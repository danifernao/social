import EntryForm from '@/components/content/entry-form';
import EntryList from '@/components/content/entry-list';
import EntryListItem from '@/components/content/entry-list-item';
import ListLoadMore from '@/components/content/list-load-more';
import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import { usePaginatedData } from '@/hooks/use-paginated-data';
import AppLayout from '@/layouts/app-layout';
import { AppContentLayout } from '@/layouts/app/app-content-layout';
import type { Auth, BreadcrumbItem, Comment, Comments, Post } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Muestra la página de una publicación y sus comentarios.
 */
export default function Home() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation('common');

    // Captura el usuario autenticado, la publicación y los comentarios proporcionados por Inertia.
    const { auth, post, comments } = usePage<{ auth: Auth; post: Post; comments: Comments }>().props;

    // Determina si hay un usuario autenticado.
    const isAuth = !!auth.user;

    const {
        items: entries, // Lista de comentarios actuales.
        cursor, // Cursor para la siguiente página de comentarios.
        processing, // Indica si se está cargando más comentarios.
        loadMore, // Función para cargar más comentarios.
        handleEntryChanges, // Función para actualizar la lista de comentarios.
    } = usePaginatedData<Comment>({
        initialItems: comments.data, // Lista inicial de comentarios.
        initialCursor: comments.meta.next_cursor, // Cursor inicial.
        fetchUrl: route('post.show', { post: post.id }), // Ruta para solicitar más comentarios.
        propKey: 'comments', // Nombre de la propiedad que devuelve Inertia con los datos a usar.
    });

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('userProfile', { username: post.user.username }),
            href: route('profile.show', { user: post.user.username }),
        },
        {
            title: t('post'),
            href: route('post.show', { post: post.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('userPost', { username: post.user.username })} />
            <AppContentLayout>
                <article className="flex flex-col gap-8">
                    <EntryListItem entry={post} />
                    <section id="comments" className="flex flex-col gap-8">
                        <EntryListUpdateContext.Provider value={handleEntryChanges}>
                            {post.comments_count > 0 && (
                                <>
                                    <h2>{t('nComments', { total: post.comments_count })}</h2>
                                    <EntryList entries={entries} />
                                    <ListLoadMore type="comment" cursor={cursor} isProcessing={processing} onClick={loadMore} autoClick={false} />
                                </>
                            )}
                            {isAuth && <EntryForm postId={post.id} />}
                        </EntryListUpdateContext.Provider>
                    </section>
                </article>
            </AppContentLayout>
        </AppLayout>
    );
}
