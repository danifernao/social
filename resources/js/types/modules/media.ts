export interface Media {    
    id: number;
    user_id: number;
    type: 'image' | 'video';
    url: string;
    thumbnail_url?: string | null;
    size: number;
    created_at: string;
    updated_at: string;
}

export interface MediaCollection {
    data: Media[];
    links: {
      next: string | null;
      prev: string | null;
    };
    meta: {
      next_cursor: string | null;
    }
}