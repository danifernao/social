import { Comment } from "./entry/comment";
import { Post } from "./entry/post";
import { User } from "./user";

export interface Report {
    id: number;
    reporter_id: number;
    closed_by_id: number;
    reporter: User;
    resolver: User | null;
    reportable_type: string;
    reportable_id: number;
    reportable_exists: boolean;
    reportable_snapshot: User | Post | Comment;
    reporter_note: string | null;
    closed_at: string;
    created_at: string;

}

export interface Reports {
    data: Report[];
    links: {
      next: string | null;
      prev: string | null;
    };
}