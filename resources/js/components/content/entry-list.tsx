import EntryListItem from '@/components/content/entry-list-item';
import type { Entry } from '@/types';
import { useEffect, useRef } from 'react';
import EmptyMessage from './empty-message';

interface EntryListProps {
    entries: Entry[]; // Lista de entradas a mostrar, las cuales pueden ser publicaciones o comentarios.
    anchorId?: number | null; // ID de la entrada a la que se debe desplazar la vista.
}

/**
 * Muestra una lista de entradas.
 * Si se proporciona un "anchorId", la vista se desplazará hacia esa entrada.
 */
export default function EntryList({ entries, anchorId }: EntryListProps) {
    // Referencia a la entrada destino hacia la cual se debe desplazar la vista.
    const anchorRef = useRef<HTMLDivElement>(null);

    // La vista se desplaza hacia la entrada destino cuando cambia el "anchorId".
    useEffect(() => {
        if (anchorRef.current) {
            anchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [anchorId]);

    return (
        <div className="flex flex-1 flex-col gap-8">
            {entries.length > 0 ? (
                entries.map((entry) => <EntryListItem key={entry.id} ref={entry.id === anchorId ? anchorRef : undefined} entry={entry} />)
            ) : (
                <EmptyMessage />
            )}
        </div>
    );
}
