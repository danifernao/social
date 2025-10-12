import { FollowNav } from '@/components/app/follow-nav';
import ListLoadMore from '@/components/app/list-load-more';
import UserList from '@/components/app/user-list';
import { usePaginatedData } from '@/hooks/app/use-paginated-data';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { Auth, BreadcrumbItem, User, Users } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface PageProps {
    auth: Auth; // Usuario autenticado.
    user: User; // Usuario del perfil visitado.
    following: Users; // Lista de seguidos.
    followers: Users; // Lista de seguidores.
    routeName: string; // Nombre de la ruta actual de la página.
    [key: string]: any;
}

/**
 * Muestra la página de seguidos o seguidores de un usuario.
 */
export default function Follow() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura las propiedades de la página proporcionadas por Inertia.
    const { auth, user, following, followers, routeName } = usePage<PageProps>().props;

    const pageName = routeName === 'follow.following' ? 'following' : 'followers';

    const {
        items: users, // Lista de los usuarios.
        nextCursor, // Cursor para la siguiente página de usuarios.
        processing, // Indica si se está cargando más usuarios.
        loadMore, // Función para cargar más usuarios.
    } = usePaginatedData<User>({
        initialItems: pageName === 'following' ? following.data : followers.data, // Lista inicial de usuarios.
        initialCursor: pageName === 'following' ? following.meta.next_cursor : followers.meta.next_cursor, // Cursor inicial.
        fetchUrl: route(routeName, { user: user.username }), // Ruta para solicitar más usuarios.
        propKey: 'users', // Nombre de la propiedad que devuelve Inertia con los datos a usar.
    });

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('profile.title', { username: user.username }),
            href: route('profile.show', { user: user.username }),
        },
        {
            title: pageName === 'following' ? t('common.following') : t('common.followers'),
            href: route(routeName, { user: user.username }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${pageName === 'following' ? t('profile.following', { username: user.username }) : t('profile.followers', { username: user.username })} ${user.username}`}
            />
            <AppContentLayout>
                <FollowNav pageName={pageName} username={user.username} />
                <UserList users={users} />
                <ListLoadMore type="user" cursor={nextCursor} isProcessing={processing} onClick={loadMore} />
            </AppContentLayout>
        </AppLayout>
    );
}
