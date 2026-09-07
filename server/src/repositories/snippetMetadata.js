export const getCategoryFacets = (db, userId = null) => {
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
  } else {
    sql += " AND s.is_public = 1";
  }

  sql += " GROUP BY c.name ORDER BY c.name";
  return db.prepare(sql).all(...params);
};
