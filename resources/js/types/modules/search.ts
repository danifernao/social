import type { User } from './user';
import type { Post } from './entry/post';

export type SearchType = 'post' | 'user';

export interface SearchTypes {
  label: string;
  value: SearchType;
}

export interface SearchResults {
    data: Post[] | User[];
    next_cursor: string;
}