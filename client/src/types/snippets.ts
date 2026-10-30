export interface CodeFragment {
  id?: string;
  file_name: string;
  code: string;
  language: string;
  position: number;
}

export interface Snippet {
  id: string;
  title: string;
  description: string;
  updated_at: string;
  expiry_date?: string;
  categories: string[];
  fragments: CodeFragment[];
  share_count?: number;
  is_public: number;
  is_pinned: number;
  is_favorite: number;
  username?: string;
  visibility?: SnippetVisibility;
  group_id?: number | null;
  group_name?: string | null;
}

export type SnippetVisibility = 'public' | 'private' | 'protected';

export interface Group {
  id: number;
  name: string;
  description?: string | null;
}

export interface ShareSettings {
  requiresAuth: boolean;
  expiresIn?: number;
}

export interface Share {
  id: string;
  snippet_id: number;
  requires_auth: number;
  view_limit: number | null;
  view_count: number;
  expires_at: string;
  created_at: string;
  expired: number;
}
