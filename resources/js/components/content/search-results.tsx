import { Post, User } from '@/types';
import EmptyMessage from './empty-message';
import EntryList from './entry-list';
import UserList from './user-list';

interface SearchResultsProps {
    results: Post[] | User[]; // Lista de publicaciones o usuarios.
    anchorId?: number | null; // ID de la entrada a la que se debe desplazar la vista.
}

/**
 * Muestra los resultados de una búsqueda.
 */
export default function SearchResults({ results, anchorId }: SearchResultsProps) {
    return (
        <>
            {results.length > 0 ? (
                results[0].type === 'post' ? (
                    <EntryList anchorId={anchorId} entries={results as Post[]} />
                ) : (
                    <UserList users={results as User[]} />
                )
            ) : (
                <EmptyMessage />
            )}
        </>
    );
}
