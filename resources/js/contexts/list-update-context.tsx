import { Comment, EntryAction, Post, User } from '@/types';
import { createContext } from 'react';

// Contextos para sincronizar cambios en los listados de publicaciones, comentarios y resultados de búsqueda.
export const PostListUpdateContext = createContext<((action: EntryAction, entry: Post) => void) | null>(null);
export const CommentListUpdateContext = createContext<((action: EntryAction, entry: Comment) => void) | null>(null);
export const SearchResultsListUpdateContext = createContext<((action: EntryAction, entry: Post | User) => void) | null>(null);
