import type { Reaction } from './reaction';
import type { User } from '../user';

export interface Comment {
    type: 'comment';
    id: number;
    user_id: number;
    post_id: number;
    post_user_id: number;
    user: User;
    content: string;
    is_pinned: boolean;
    reactions: Reaction[];
    created_at: string;
    updated_at: string;
    last_edited_at: string | null;
}

export interface Comments {
    data: Comment[];
    meta: {
      next_cursor: string | null;
    };
}