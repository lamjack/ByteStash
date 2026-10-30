import { apiClient } from './apiClient';

const BASE_URL = '/api/admin';

// Helper to build query string
const buildQueryString = (params: Record<string, any>): string => {
  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return queryString ? `?${queryString}` : '';
};

export const adminApi = {
  // Dashboard
  getStats: () => apiClient.get<any>(`${BASE_URL}/stats`, { requiresAuth: true }),

  // Users
  getUsers: (params: {
    offset?: number;
    limit?: number;
    search?: string;
    authType?: string;
    isActive?: string;
  } = {}) =>
    apiClient.get<any>(`${BASE_URL}/users${buildQueryString(params)}`, {
      requiresAuth: true,
    }),

  getUserDetails: (id: number) =>
    apiClient.get<any>(`${BASE_URL}/users/${id}`, { requiresAuth: true }),

  deleteUser: (id: number) =>
    apiClient.delete<any>(`${BASE_URL}/users/${id}`, { requiresAuth: true }),

  toggleUserActive: (id: number) =>
    apiClient.patch<any>(`${BASE_URL}/users/${id}/toggle-active`, {}, { requiresAuth: true }),

  // Snippets
  getSnippets: (params: {
    offset?: number;
    limit?: number;
    search?: string;
    userId?: string;
    isPublic?: string;
    language?: string;
    category?: string;
  } = {}) =>
    apiClient.get<any>(`${BASE_URL}/snippets${buildQueryString(params)}`, {
      requiresAuth: true,
    }),

  getSnippetDetails: (id: number) =>
    apiClient.get<any>(`${BASE_URL}/snippets/${id}`, { requiresAuth: true }),

  deleteSnippet: (id: number) =>
    apiClient.delete<any>(`${BASE_URL}/snippets/${id}`, { requiresAuth: true }),

  changeSnippetOwner: (id: number, newUserId: number) =>
    apiClient.patch<any>(
      `${BASE_URL}/snippets/${id}/owner`,
      { newUserId },
      { requiresAuth: true }
    ),

  toggleSnippetPublic: (id: number) =>
    apiClient.patch<any>(`${BASE_URL}/snippets/${id}/toggle-public`, {}, { requiresAuth: true }),

  scanSnippetsForOffensive: () =>
    apiClient.get<any>(`${BASE_URL}/snippets/scan/offensive`, { requiresAuth: true }),

  // API Keys
  getApiKeys: (params: {
    offset?: number;
    limit?: number;
    userId?: string;
  } = {}) =>
    apiClient.get<any>(`${BASE_URL}/api-keys${buildQueryString(params)}`, {
      requiresAuth: true,
    }),

  deleteApiKey: (id: number) =>
    apiClient.delete<any>(`${BASE_URL}/api-keys/${id}`, { requiresAuth: true }),

  // Shares
  getShares: (params: {
    offset?: number;
    limit?: number;
    userId?: string;
    requiresAuth?: string;
  } = {}) =>
    apiClient.get<any>(`${BASE_URL}/shares${buildQueryString(params)}`, {
      requiresAuth: true,
    }),

  deleteShare: (id: string) =>
    apiClient.delete<any>(`${BASE_URL}/shares/${id}`, { requiresAuth: true }),

  // Instance settings
  getSettings: () =>
    apiClient.get<{ allowNewAccounts: boolean }>(`${BASE_URL}/settings`, { requiresAuth: true }),

  updateSettings: (settings: { allowNewAccounts: boolean }) =>
    apiClient.patch<{ allowNewAccounts: boolean }>(`${BASE_URL}/settings`, settings, {
      requiresAuth: true,
    }),

  // Groups
  getGroups: () => apiClient.get<any[]>(`${BASE_URL}/groups`, { requiresAuth: true }),

  createGroup: (group: { name: string; description?: string }) =>
    apiClient.post<any>(`${BASE_URL}/groups`, group, { requiresAuth: true }),

  updateGroup: (id: number, group: { name: string; description?: string }) =>
    apiClient.put<any>(`${BASE_URL}/groups/${id}`, group, { requiresAuth: true }),

  deleteGroup: (id: number) =>
    apiClient.delete<any>(`${BASE_URL}/groups/${id}`, { requiresAuth: true }),

  getGroupMembers: (id: number) =>
    apiClient.get<{ members: any[]; invites: any[] }>(`${BASE_URL}/groups/${id}/members`, {
      requiresAuth: true,
    }),

  // identifier: an existing username or email, or an email to invite
  addGroupMember: (id: number, identifier: string) =>
    apiClient.post<any>(`${BASE_URL}/groups/${id}/members`, { identifier }, { requiresAuth: true }),

  removeGroupMember: (id: number, userId: number) =>
    apiClient.delete<any>(`${BASE_URL}/groups/${id}/members/${userId}`, { requiresAuth: true }),

  removeGroupInvite: (id: number, email: string) =>
    apiClient.delete<any>(`${BASE_URL}/groups/${id}/invites/${encodeURIComponent(email)}`, {
      requiresAuth: true,
    }),
};
