import { Post, User } from '@/types';
import EmptyMessage from './empty-message';
import EntryList from './entry-list';
import UserList from './user-list';

interface SearchResultsProps {
    results: Post[] | User[]; // Lista de publicaciones o usuarios.
}

/**
 * Muestra los resultados de una búsqueda.
 */
export default function SearchResults({ results }: SearchResultsProps) {
    return (
        <>
            {results.length > 0 ? (
                results[0].type === 'post' ? (
                    <EntryList entries={results as Post[]} />
                ) : (
                    <UserList users={results as User[]} />
                )
            ) : (
                <EmptyMessage />
            )}
        </>
    );
}
