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
 * Vista que muestra el perfil público de un usuario,
 * junto con su listado de publicaciones.
 */
export default function ProfileShow() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura el usuario autenticado, el usuario del perfil
    // y la lista de publicaciones proporcionados por Inertia.
    const { auth, user, posts } = usePage<{ auth: Auth; user: User; posts: Posts }>().props;

    // Determina si el usuario autenticado está visitando su propio perfil.
    const isOwner = auth.user && user.id === auth.user.id;

    // Determina si el usuario autenticado tiene permisos de moderación.
    const isMod = auth.user && auth.user.can_moderate;

    // ID del usuario del perfil usado para crear publicaciones en su nombre
    // (solo permitido para moderadores).
    const profileUserId = !isOwner && isMod ? user.id : null;

    // Usa el hook de paginación para gestionar las publicaciones del perfil.
    const {
        items: entries, // Lista actual de publicaciones visibles.
        nextCursor, // Cursor para solicitar la siguiente página de publicaciones.
        processing, // Indica si se está cargando más contenido.
        loadMore, // Función para cargar más publicaciones.
        handleEntryChanges, // Función para sincronizar cambios en el listado.
    } = usePaginatedData<Post>({
        initialItems: posts.data, // Publicaciones iniciales cargadas desde el servidor.
        initialCursor: posts.meta.next_cursor, // Cursor inicial de paginación.
        fetchUrl: route('profile.show', user.username), // Ruta usada para solicitar más publicaciones.
        propKey: 'posts', // Propiedad de la respuesta de Inertia que contiene los datos.
        isEntry: true, // Indica que se trabaja con entradas tipo "Entry" (publicación o comentario).
    });

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('profile.title', { username: user.username }),
            href: route('profile.show', user.username),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('profile.title', { username: user.username })} />

            <AppContentLayout>
                {/* Encabezado del perfil del usuario */}
                <ProfileHeader user={user} />

                {/* Contexto para sincronizar cambios en el listado de publicaciones */}
                <EntryListUpdateContext.Provider value={handleEntryChanges}>
                    {/* Formulario para crear publicaciones */}
                    {(isOwner || isMod) && <EntryForm profileUserId={profileUserId} />}

                    {/* Listado de publicaciones del perfil */}
                    <EntryList entries={entries} />
                </EntryListUpdateContext.Provider>

                {/* Botón para cargar más publicaciones */}
                <ListLoadMore type="post" cursor={nextCursor} isProcessing={processing} onClick={loadMore} />
            </AppContentLayout>
        </AppLayout>
    );
}
