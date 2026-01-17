import EntryListItem from '@/components/app/entry-list-item';
import type { Entry } from '@/types';
import EmptyMessage from './empty-message';

interface EntryListProps {
    // Lista de entradas a mostrar, pueden ser publicaciones o comentarios.
    entries: Entry[];
}

/**
 * Listado de entradas.
 */
export default function EntryList({ entries }: EntryListProps) {
    return (
        <div className="flex flex-1 flex-col gap-8">
            {entries.length > 0 ? entries.map((entry) => <EntryListItem key={entry.id} entry={entry} />) : <EmptyMessage />}
        </div>
    );
}
