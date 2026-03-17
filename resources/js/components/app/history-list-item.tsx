import type { EntryType } from '@/types';
import { History } from '@/types/modules/entry/history';
import { formatDistanceToNow, Locale } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { Trans, useTranslation } from 'react-i18next';
import TextLink from '../kit/text-link';
import RichTextRenderer from './rich-text-renderer';

interface EntryListItemProps {
    first: boolean;
    history: History;
}

/**
 * Registro de un cambio en el contenido de la entrada.
 */
export default function HistoryListItem({ first, history }: EntryListItemProps) {
    // Funciones de traducción y acceso al idioma actual.
    const { i18n, t } = useTranslation();

    // Relación entre idioma y configuración regional de fechas.
    const localeMap: Record<string, Locale> = {
        en: enUS,
        es,
    };

    // Selecciona la configuración regional según el idioma activo.
    const locale = localeMap[i18n.currentLang] ?? enUS;

    // Tiempo relativo desde la creación del registro.
    const distanceToNow = formatDistanceToNow(new Date(history.created_at), {
        addSuffix: true,
        locale,
    });

    return (
        <>
            <article className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border px-6 py-6 shadow-sm">
                {/* Contenido del registro */}
                <RichTextRenderer entryType={history.historable_type as EntryType} text={history.content} />

                <footer className="flex justify-end divide-x">
                    {/* Nombre de usuario de quien creó o editó la entrada */}
                    <div className="pr-2 text-sm">
                        {history.user ? (
                            <Trans i18nKey={first ? 'created_by_user' : 'edited_by_user'} values={{ username: history.user.username }}>
                                <span className="text-muted-foreground"></span>
                                <TextLink href={route('profile.show', history.user.username)}></TextLink>
                            </Trans>
                        ) : (
                            t(first ? 'created_by_deleted_user_no' : 'edited_by_deleted_user_no', { id: history.user_id })
                        )}
                    </div>

                    {/* Fecha de creación del registro */}
                    <div className="pl-2 text-sm">
                        <time dateTime={history.created_at}>{distanceToNow}</time>
                    </div>
                </footer>
            </article>
        </>
    );
}
