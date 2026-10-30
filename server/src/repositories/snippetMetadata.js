// Matches snippets published to a group the viewer belongs to. Expects one bound param: the viewer id.
export const GROUP_MEMBER_SQL =
  "(s.is_public = 0 AND s.group_id IS NOT NULL AND s.group_id IN (SELECT group_id FROM user_group_members WHERE user_id = ?))";

// Public listing: anonymous viewers see public snippets, signed-in viewers also see their groups' snippets.
export const visibleToViewerSql = (viewerId = null) =>
  viewerId != null ? `(s.is_public = 1 OR ${GROUP_MEMBER_SQL})` : "s.is_public = 1";

// Group view: group-only snippets of the viewer's groups plus the viewer's own group-only snippets.
// Expects two bound params: the viewer id twice.
export const GROUP_LISTING_SQL =
  "(s.is_public = 0 AND s.group_id IS NOT NULL AND (s.user_id = ? OR s.group_id IN (SELECT group_id FROM user_group_members WHERE user_id = ?)))";

export const getCategoryFacets = (db, userId = null, viewerId = null, groupViewerId = null) => {
  let sql = `
    SELECT c.name AS value, COUNT(DISTINCT c.snippet_id) AS count
    FROM categories c
    INNER JOIN snippets s ON c.snippet_id = s.id
    WHERE s.expiry_date IS NULL
  `;
  const params = [];

  if (userId !== null) {
    sql += " AND s.user_id = ?";
    params.push(userId);
  } else if (groupViewerId != null) {
    sql += ` AND ${GROUP_LISTING_SQL}`;
    params.push(groupViewerId, groupViewerId);
  } else {
    sql += ` AND ${visibleToViewerSql(viewerId)}`;
    if (viewerId != null) params.push(viewerId);
  }

  sql += " GROUP BY c.name ORDER BY c.name";
  return db.prepare(sql).all(...params);
};
