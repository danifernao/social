import { Post, User } from '@/types';
import EmptyMessage from './empty-message';
import EntryList from './entry-list';
import UserList from './user-list';

interface SearchResultsProps {
    results: Post[] | User[]; // Resultados de la búsqueda (publicaciones o usuarios).
}

/**
 * Resultados de una búsqueda según su tipo.
 */
export default function SearchResults({ results }: SearchResultsProps) {
    return (
        <>
            {/* Si hay resultados, determina qué tipo de lista renderizar */}
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
