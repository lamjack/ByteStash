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
  user_id?: number;
  visibility?: SnippetVisibility;
  shares?: ShareTarget[];
  edit_permission?: EditPermission;
  // Only on single-snippet reads for a signed-in viewer
  is_owner?: boolean;
  can_edit?: boolean;
}

// 'owner': the owner plus share targets with 'edit'; 'readonly': locked for everyone
export type EditPermission = 'owner' | 'readonly';

export type SharePermission = 'view' | 'edit';

// A group or person a 'protected' snippet is shared with
export interface ShareTarget {
  type: 'group' | 'user';
  id: number;
  name?: string;
  permission: SharePermission;
}

export interface ShareUser {
  id: number;
  username: string;
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
