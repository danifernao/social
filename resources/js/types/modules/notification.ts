export interface Notification {
    id: string;
    read_at: string | null;
    data: {
        type: 'mention' | 'comment' | 'follow';
        data: {
            sender: {
                id: number;
                username: string;
            };
            context?: {
                type: 'comment' | 'post';
                id: number;
                author_id?: number;
            };
        };
    };
    updated_at: string;
    created_at: string;
}

export interface Notifications {
  data: Notification[];
  meta: {
    next_cursor: string | null;
  };
}