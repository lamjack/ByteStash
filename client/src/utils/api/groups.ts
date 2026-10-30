import { apiClient } from './apiClient';
import type { Group, ShareUser } from '../../types/snippets';

// Groups the signed-in user may share snippets with.
export const fetchPublishableGroups = () =>
  apiClient.get<Group[]>('/api/groups', { requiresAuth: true });

// People to share a snippet with, matched by part of their username.
export const searchShareUsers = (query: string) =>
  apiClient.get<ShareUser[]>(`/api/groups/share-users?q=${encodeURIComponent(query)}`, { requiresAuth: true });
