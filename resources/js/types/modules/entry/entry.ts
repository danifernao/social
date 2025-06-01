import type { Post } from './post';
import type { Comment } from './comment';

export type Entry = Post | Comment;
export type EntryType = 'post' | 'comment';
export type EntryAction = 'create' | 'update' | 'delete';