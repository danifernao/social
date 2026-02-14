export interface Invitation {
    id: number;
    token: string;
    creator_id: number;
    used_by_id: number | null;
    creator: {
        id: number;
        username: string;
    } | null;
    used_by: {
        id: number;
        username: string;
    } | null;
    used_at: string | null;
    created_at: string;
}

export interface Invitations {
    data: Invitation[];
    links: {
      next: string | null;
      prev: string | null;
    };
}