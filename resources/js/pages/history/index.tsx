import HistoryList from '@/components/app/history-list';
import ListLoadMore from '@/components/app/list-load-more';
import { usePaginatedData } from '@/hooks/app/use-paginated-data';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem, Comment, Post } from '@/types';
import { Histories, History } from '@/types/modules/entry/history';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Vista principal que muestra el historial de cambios de una entrada.
 */
export default function HomeIndex() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura la publicación, comentario y su historial de cambios
    // proporcionados por Inertia.
    const { post, comment, histories } = usePage<{ post: Post; comment: Comment | null; histories: Histories }>().props;

    // Usa el hook de paginación para gestionar el historial de cambios.
    const {
        items: records, // Lista actual de registros del historial.
        nextCursor, // Cursor para solicitar la siguiente página del historial.
        processing, // Indica si se está cargando más contenido.
        loadMore, // Función para cargar más registros.
    } = usePaginatedData<History>({
        initialItems: histories.data, // Registros iniciales cargadas desde el servidor.
        initialCursor: histories.meta.next_cursor, // Cursor inicial de paginación.
        propKey: 'histories', // Propiedad de la respuesta de Inertia que contiene los datos.
    });

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('user_profile', { username: post.user.username }),
            href: route('profile.show', post.user.username),
        },
        {
            title: t('single_post'),
            href: route('post.show', post.id),
        },
        ...(comment
            ? [
                  {
                      title: t('single_comment'),
                      href:
                          route('post.comment.show', {
                              post: post.id,
                              comment: comment.id,
                          }) + '#comments',
                  },
              ]
            : []),
        {
            title: t('edit_history'),
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('edit_history')} />

            <AppContentLayout>
                <HistoryList histories={records} />

                {/* Botón para cargar más publicaciones */}
                <ListLoadMore type="post" cursor={nextCursor} isProcessing={processing} onClick={loadMore} />
            </AppContentLayout>
        </AppLayout>
    );
}
