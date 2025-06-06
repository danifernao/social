import type { Reaction } from './reaction';
import type { User } from '../user';

export interface Comment {
    type: 'comment';
    id: number;
    user_id: number;
    post_id: number;
    user: User;
    content: string;
    reactions: Reaction[];
    updated_at: string;
    created_at: string;
}

export interface Comments {
    data: Comment[];
    meta: {
      next_cursor: string | null;
    };
}