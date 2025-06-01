export interface User {
  type: 'user';
  id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  email_verified_at: string | null;
  isFollowing?: boolean;
  follows_count: number;
  followers_count: number;
  isBlocked?: boolean;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}