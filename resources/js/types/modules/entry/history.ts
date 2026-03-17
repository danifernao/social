import type { User } from '../user';

export interface History {
    id: number;
    user_id: number;
    user: User;
    historable_id: number;
    historable_type: string;
    content: string;
    updated_at: string;
    created_at: string;
}

export interface Histories {
    data: History[];
    meta: {
        next_cursor: string | null;
    };
}