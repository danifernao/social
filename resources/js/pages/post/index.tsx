import EntryForm from '@/components/content/entry-form';
import EntryList from '@/components/content/entry-list';
import EntryListItem from '@/components/content/entry-list-item';
import ListLoadMore from '@/components/content/list-load-more';
import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import { usePaginatedData } from '@/hooks/use-paginated-data';
import AppLayout from '@/layouts/app-layout';
import { ContentInner } from '@/layouts/content/inner-layout';
import type { Auth, BreadcrumbItem, Comment, Post } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface PageProps {
    auth: Auth; // Usuario autenticado.
    post: Post; // Publicación actual.
    comments: {
        data: Comment[]; // Lista de comentarios asociados a la publicación.
        next_cursor: string; // Cursor para la siguiente página de comentarios.
    };
    [key: string]: any;
}

/**
 * Muestra la página de una publicación y sus comentarios.
 */
export default function Home() {
    // Accede al usuario autenticado, la publicación y los comentarios proporcionados por Inertia.
    const { auth, post, comments } = usePage<PageProps>().props;

    // Determina si hay un usuario autenticado.
    const isAuth = !!auth.user;

    const {
        items: entries, // Lista de comentarios actuales.
        cursor, // Cursor para la siguiente página de comentarios.
        processing, // Indica si se está cargando más comentarios.
        loadMore, // Función para cargar más comentarios.
        handleEntryChanges, // Función para actualizar la lista de comentarios.
        firstItemId, // ID del primer comentario agregado a la lista después de llamar a "loadMore".
    } = usePaginatedData<Comment>({
        initialItems: comments.data, // Lista inicial de comentarios.
        initialCursor: comments.next_cursor, // Cursor inicial.
        fetchUrl: route('post.show', { post: post.id }), // Ruta para solicitar más comentarios.
        propKey: 'comments', // Nombre de la propiedad que devuelve Inertia con los datos a usar.
    });

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `Perfil de ${post.user.username}`,
            href: route('profile.show', { user: post.user.username }),
        },
        {
            title: 'Publicación',
            href: route('post.show', { post: post.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Publicación" />
            <ContentInner>
                <article className="flex flex-col gap-8">
                    <EntryListItem entry={post} />
                    <section id="comments" className="flex flex-col gap-8">
                        <EntryListUpdateContext.Provider value={handleEntryChanges}>
                            {post.comments_count > 0 && (
                                <>
                                    <h2>{post.comments_count} comentarios:</h2>
                                    <EntryList anchorId={firstItemId} entries={entries} />
                                    {cursor && <ListLoadMore type="comment" isProcessing={processing} onClick={loadMore} />}
                                </>
                            )}
                            {isAuth && <EntryForm postId={post.id} />}
                        </EntryListUpdateContext.Provider>
                    </section>
                </article>
            </ContentInner>
        </AppLayout>
    );
}
