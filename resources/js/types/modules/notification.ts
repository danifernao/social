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
      };
    };
  };
  updated_at: string;
  created_at: string;
}