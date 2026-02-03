export interface Report {
    id: number;
    reportable_type: string;
    reportable_id: number;
}

export interface Reports {
    data: Report[];
    links: {
      next: string | null;
      prev: string | null;
    };
}