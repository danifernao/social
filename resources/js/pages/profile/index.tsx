import EntryForm from '@/components/content/entry-form';
import EntryList from '@/components/content/entry-list';
import ListLoadMore from '@/components/content/list-load-more';
import ProfileHeader from '@/components/content/profile-header';
import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import { usePaginatedData } from '@/hooks/use-paginated-data';
import AppLayout from '@/layouts/app-layout';
import { ContentInner } from '@/layouts/content/inner-layout';
import type { Auth, BreadcrumbItem, Post, User } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface PageProps {
    auth: Auth; // Usuario autenticado.
    user: User; // Usuario del perfil visitado.
    posts: {
        data: Post[]; // Lista de publicaciones del usuario del perfil.
        next_cursor: string; // Cursor para la siguiente página de publicaciones.
    };
    [key: string]: any;
}

/**
 * Muestra la página de perfil de un usuario.
 */
export default function Profile() {
    // Accede al usuario autenticado, al usuario del perfil y a la lista de publicaciones proporcionados por Inertia.
    const { auth, user, posts } = usePage<PageProps>().props;

    // Determina si el usuario autenticado está visitando su propio perfil.
    const isOwner = auth.user && user.id === auth.user.id;

    const {
        items: entries, // Lista de publicaciones actuales.
        cursor, // Cursor para la siguiente página de publicaciones.
        processing, // Indica si se está cargando más publicaciones.
        loadMore, // Función para cargar más publicaciones.
        handleEntryChanges, // Función para actualizar la lista de publicaciones.
        firstItemId, // ID de la primera publicación agregada a la lista después de llamar a "loadMore".
    } = usePaginatedData<Post>({
        initialItems: posts.data, // Lista inicial de publicaciones.
        initialCursor: posts.next_cursor, // Cursor inicial.
        fetchUrl: route('profile.show', { user: user.username }), // Ruta para solicitar más publicaciones.
        propKey: 'posts', // Nombre de la propiedad que devuelve Inertia con los datos a usar.
        isEntry: true, // Indica que se está trabajando con entradas tipo "Entry" (publicación o comentario).
    });

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `Perfil de ${user.username}`,
            href: route('profile.show', { user: user.username }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Perfil de ${user.username}`} />
            <ContentInner>
                <ProfileHeader user={user} />
                <EntryListUpdateContext.Provider value={handleEntryChanges}>
                    {isOwner && <EntryForm />}
                    <EntryList anchorId={firstItemId} entries={entries} />
                </EntryListUpdateContext.Provider>
                {cursor && <ListLoadMore type="post" isProcessing={processing} onClick={loadMore} />}
            </ContentInner>
        </AppLayout>
    );
}
