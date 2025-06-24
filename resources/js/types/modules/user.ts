export interface User {
    type: 'user';
    id: number;
    username: string;
    email: string;
    avatar_url: string | null;
    email_verified_at: string | null;
    is_followed?: boolean | null;
    follows_count?: number;
    followers_count?: number;
    is_blocked: boolean | null;
    has_blocked: boolean | null;
    role: 'user' | 'mod' | 'admin';
    is_admin: boolean;
    can_moderate: boolean;
    is_active: boolean;
    language: 'es' | 'en';
    created_at: string;
    updated_at: string;
}

export interface Users {
    data: User[];
    links: {
      next: string | null;
      prev: string | null;
    };
    meta: {
      next_cursor: string | null;
    }
}