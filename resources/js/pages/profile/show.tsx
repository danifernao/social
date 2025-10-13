import EntryForm from '@/components/app/entry-form';
import EntryList from '@/components/app/entry-list';
import ListLoadMore from '@/components/app/list-load-more';
import ProfileHeader from '@/components/app/profile-header';
import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import { usePaginatedData } from '@/hooks/app/use-paginated-data';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { Auth, BreadcrumbItem, Post, Posts, User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Muestra la página de perfil de un usuario.
 */
export default function ProfileShow() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura el usuario autenticado, el usuario del perfil y la lista de publicaciones proporcionados por Inertia.
    const { auth, user, posts } = usePage<{ auth: Auth; user: User; posts: Posts }>().props;

    // Determina si el usuario autenticado está visitando su propio perfil.
    const isOwner = auth.user && user.id === auth.user.id;
    const isMod = auth.user && auth.user.can_moderate;

    // ID del usuario cuyo perfil se está visitando.
    const profileUserId = !isOwner && isMod ? user.id : null;

    const {
        items: entries, // Lista de publicaciones actuales.
        nextCursor, // Cursor para la siguiente página de publicaciones.
        processing, // Indica si se está cargando más publicaciones.
        loadMore, // Función para cargar más publicaciones.
        handleEntryChanges, // Función para actualizar la lista de publicaciones.
    } = usePaginatedData<Post>({
        initialItems: posts.data, // Lista inicial de publicaciones.
        initialCursor: posts.meta.next_cursor, // Cursor inicial.
        fetchUrl: route('profile.show', user.username), // Ruta para solicitar más publicaciones.
        propKey: 'posts', // Nombre de la propiedad que devuelve Inertia con los datos a usar.
        isEntry: true, // Indica que se está trabajando con entradas tipo "Entry" (publicación o comentario).
    });

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('profile.title', { username: user.username }),
            href: route('profile.show', user.username),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('profile.title', { username: user.username })} />
            <AppContentLayout>
                <ProfileHeader user={user} />
                <EntryListUpdateContext.Provider value={handleEntryChanges}>
                    {(isOwner || isMod) && <EntryForm profileUserId={profileUserId} />}
                    <EntryList entries={entries} />
                </EntryListUpdateContext.Provider>
                <ListLoadMore type="post" cursor={nextCursor} isProcessing={processing} onClick={loadMore} />
            </AppContentLayout>
        </AppLayout>
    );
}
