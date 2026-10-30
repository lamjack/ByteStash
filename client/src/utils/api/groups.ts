import { apiClient } from './apiClient';
import type { Group } from '../../types/snippets';

// Groups the signed-in user may publish group-only snippets to.
export const fetchPublishableGroups = () =>
  apiClient.get<Group[]>('/api/groups', { requiresAuth: true });
