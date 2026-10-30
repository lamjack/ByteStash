// Snippets shared with the viewer, directly or through one of their groups.
// Expects two bound params: the viewer id twice.
export const SHARED_WITH_VIEWER_SQL = `(s.is_public = 0 AND EXISTS (
  SELECT 1 FROM snippet_shares sh
  WHERE sh.snippet_id = s.id
    AND (sh.user_id = ? OR sh.group_id IN (SELECT group_id FROM user_group_members WHERE user_id = ?))
))`;

// Shared view: snippets shared with the viewer plus the viewer's own shared snippets.
// Expects three bound params: the viewer id three times.
export const SHARED_LISTING_SQL = `((s.user_id = ? AND s.is_public = 0 AND EXISTS (
  SELECT 1 FROM snippet_shares sh WHERE sh.snippet_id = s.id
)) OR ${SHARED_WITH_VIEWER_SQL})`;

/**
 * The WHERE clause (and its params) for a listing scope: the owner's snippets (userId),
 * the shared view (sharedViewerId), or public snippets plus those shared with viewerId.
 */
export function scopeFilter({ userId = null, viewerId = null, sharedViewerId = null } = {}) {
  if (userId !== null) return { sql: "s.user_id = ?", params: [userId] };
  if (sharedViewerId != null) {
    return { sql: SHARED_LISTING_SQL, params: [sharedViewerId, sharedViewerId, sharedViewerId] };
  }
  if (viewerId != null) {
    return { sql: `(s.is_public = 1 OR ${SHARED_WITH_VIEWER_SQL})`, params: [viewerId, viewerId] };
  }
  return { sql: "s.is_public = 1", params: [] };
}

export const getCategoryFacets = (db, userId = null, viewerId = null, sharedViewerId = null) => {
  const scope = scopeFilter({ userId, viewerId, sharedViewerId });
  const sql = `
    SELECT c.name AS value, COUNT(DISTINCT c.snippet_id) AS count
    FROM categories c
    INNER JOIN snippets s ON c.snippet_id = s.id
    WHERE s.expiry_date IS NULL AND ${scope.sql}
    GROUP BY c.name ORDER BY c.name
  `;
  return db.prepare(sql).all(...scope.params);
};
