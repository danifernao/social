import { formatDate } from '@/lib/utils';
import type { Auth, Entry, Post } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { formatDistanceToNow, Locale } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { buttonVariants } from '../ui/button';
import EntryItemOptions from './entry-list-item-options';
import EntryListItemReactions from './entry-list-item-reactions';
import FormattedText from './formatted-text';
import UserAvatar from './user-avatar';
import UserRoleBadge from './user-role-badge';

interface EntryListItemProps {
    // Entrada a mostrar, puede ser una publicación o un comentario.
    entry: Entry;
}

/**
 * Entrada (publicación o comentario).
 */
export default function EntryListItem({ entry }: EntryListItemProps) {
    // Funciones de traducción y acceso al idioma actual.
    const { i18n, t } = useTranslation();

    // Relación entre idioma y configuración regional de fechas.
    const localeMap: Record<string, Locale> = {
        en: enUS,
        es,
    };

    // Selecciona la configuración regional según el idioma activo.
    const locale = localeMap[i18n.currentLang] ?? enUS;

    // Captura el usuario autenticado y nombre de la ruta actual proporcionados por Inertia.
    const { auth, routeName } = usePage<{ auth: Auth; routeName: string }>().props;

    // Tiempo relativo desde la creación de la entrada.
    const distanceToNow = formatDistanceToNow(new Date(entry.created_at), {
        addSuffix: true,
        locale,
    });

    return (
        <article className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border px-6 py-6 shadow-sm">
            <header className="flex gap-4">
                <div className="flex flex-1 items-center justify-center gap-3">
                    {/* Avatar del autor */}
                    <UserAvatar user={entry.user} />

                    {/* Nombre de usuario y rol del autor */}
                    <div className="felx flex-1 items-center font-semibold">
                        <Link href={route('profile.show', entry.user.username)}>{entry.user.username}</Link>
                        <UserRoleBadge role={entry.user.role} />
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                    {/* Fecha de creación con enlace a la entrada */}
                    <div className="flex gap-4 text-sm">
                        <Link
                            href={
                                entry.type === 'post'
                                    ? route('post.show', entry.id)
                                    : route('post.comment.show', { post: entry.post_id, comment: entry.id })
                            }
                            title={formatDate(entry.created_at)}
                        >
                            <time dateTime={entry.created_at}>{distanceToNow}</time>
                        </Link>
                    </div>

                    {/* Opciones disponibles para los usuarios autenticados */}
                    {auth.user && (
                        <div>
                            <EntryItemOptions entry={entry} />
                        </div>
                    )}
                </div>
            </header>

            {/* Contenido principal de la entrada */}
            <FormattedText entryType={entry.type} text={entry.content} />

            <footer className="flex gap-4">
                {/* Reacciones de la entrada */}
                <EntryListItemReactions entry={entry} />

                {/* Enlace a los comentarios cuando es una publicación */}
                {entry.type === 'post' && routeName !== 'post.show' && (
                    <div className="ml-auto">
                        <Link href={`/post/${entry.id}#comments`} className={buttonVariants({ variant: 'outline' })} title={t('comment')}>
                            {(entry as Post).comments_count} <MessageSquare />
                        </Link>
                    </div>
                )}
            </footer>
        </article>
    );
}
