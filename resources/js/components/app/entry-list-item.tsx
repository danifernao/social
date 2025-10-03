import type { Auth, Entry, Post } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { format, formatDistanceToNow, Locale, parseISO } from 'date-fns';
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
    entry: Entry; // Una publicación o un comentario.
}

/**
 * Muestra una entrada, la cual puede ser una publicación o un comentario.
 * Se usa "forwardRef" para permitir el manejo de referencias externas, como por ejemplo para el desplazamiento automático.
 */
export default function EntryListItem({ entry }: EntryListItemProps) {
    // Obtiene las traducciones de la página.
    const { i18n, t } = useTranslation();

    // Relación entre idioma y formato de fecha.
    const localeMap: Record<string, Locale> = {
        es,
        en: enUS,
    };

    // Selecciona el idioma adecuado según el idioma actual de la aplicación.
    const locale = localeMap[i18n.language] ?? es;

    // Captura el usuario autenticado y la ruta actual proporcionados por Inertia.
    const { auth, routeName } = usePage<{ auth: Auth; routeName: string }>().props;

    // Determina si el usuario autenticado es el autor de la entrada.
    const isOwner = auth.user && entry.user_id === auth.user.id;

    // Función que convierte una fecha ISO en formato corto y legible.
    const formatDate = (date: string) => {
        return format(parseISO(date), 'dd/MM/yyyy h:mm a');
    };

    // Tiempo relativo en español desde que se creó la entrada.
    const distanceToNow = formatDistanceToNow(new Date(entry.created_at), {
        addSuffix: true,
        locale,
    });

    return (
        <article className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border px-6 py-6 shadow-sm">
            <header className="flex gap-4">
                <div className="flex flex-1 items-center justify-center gap-3">
                    <UserAvatar user={entry.user} />
                    <div className="felx flex-1 items-center font-semibold">
                        <Link href={`/user/${entry.user.username}`}>{entry.user.username}</Link>
                        <UserRoleBadge role={entry.user.role} />
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <div className="flex gap-4 text-sm">
                        <Link
                            href={entry.type === 'post' ? `/post/${entry.id}` : `/post/${entry.post_id}?comment_id=${entry.id}`}
                            title={formatDate(entry.created_at)}
                        >
                            <time dateTime={entry.created_at}>{distanceToNow}</time>
                        </Link>
                    </div>
                    {(isOwner || auth.user?.can_moderate) && (
                        <div>
                            <EntryItemOptions entry={entry} />
                        </div>
                    )}
                </div>
            </header>

            <FormattedText entryType={entry.type} text={entry.content} />

            <footer className="flex gap-4">
                <EntryListItemReactions entry={entry} />
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
