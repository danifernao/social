export interface Page {
    id: number;
    language: string;
    type: PageType;
    title: string;
    slug: string;
    content: string | null;
    created_at: string;
}

export type PageType = 'normal' | 'about' | 'terms' | 'policy' | 'guidelines';

export interface Pages {
    data: Page[];
    links: {
      next: string | null;
      prev: string | null;
    };
}

export interface SpecialPages {
    [language: string]: {
        about: { slug: string } | null;
        terms: { slug: string } | null;
        policy: { slug: string } | null;
        guidelines: { slug: string } | null;
    }
}