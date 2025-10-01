import type { Reaction } from './reaction';
import type { User } from '../user';

export interface Post {
    type: 'post';
    id: number;
    user_id: number;
    user: User;
    profile_user_id: null | number;
    content: string;
    comments_count: number;
    reactions: Reaction[];
    updated_at: string;
    created_at: string;
}

export interface Posts {
    data: Post[];
    meta: {
        next_cursor: string | null;
    };
}
