export interface Page {
    id: number;
    title: string;
    slug: string;
    content: string | null;
    created_at: string;
}

export interface Pages {
    data: Page[];
    links: {
      next: string | null;
      prev: string | null;
    };
}