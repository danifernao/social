export interface Page {
    id: number;
    language: string;
    type: PageType;
    title: string;
    slug: string;
    
    content: string | null;
    created_at: string;
}

export type PageType = 'policy' | 'guidelines' | 'normal';

export interface Pages {
    data: Page[];
    links: {
      next: string | null;
      prev: string | null;
    };
}