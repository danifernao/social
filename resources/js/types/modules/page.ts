export interface Page {
    id: number;
    title: string;
    slug: string;
    language: string;
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