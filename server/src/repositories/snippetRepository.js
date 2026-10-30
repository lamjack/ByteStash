import { getDb } from "../config/database.js";
import Logger from "../logger.js";
import { getCategoryFacets, scopeFilter, SHARED_WITH_VIEWER_SQL } from "./snippetMetadata.js";

export function getVisibility(snippet) {
  if (snippet.is_public) return "public";
  if (snippet.shares?.length) return "protected";
  return "private";
}

class SnippetRepository {
  constructor() {
    this.selectAllStmt = null;
    this.selectPublicStmt = null;
    this.insertSnippetStmt = null;
    this.insertFragmentStmt = null;
    this.insertCategoryStmt = null;
    this.updateSnippetStmt = null;
    this.deleteFragmentsStmt = null;
    this.deleteCategoriesStmt = null;
    this.selectByIdStmt = null;
    this.selectPublicByIdStmt = null;
    this.moveToRecycleBinStmt = null;
    this.deleteSnippetStmt = null;
    this.selectFragmentsStmt = null;
    this.selectAllDeletedStmt = null;
    this.deleteExpiredSnippetsStmt = null;
    this.restoreSnippetStmt = null;
    this.setPinnedStmt = null;
    this.setFavoriteStmt = null;
  }

  #initializeStatements() {
    const db = getDb();

    if (!this.selectAllStmt) {
      this.selectAllStmt = db.prepare(`
        SELECT 
          s.id,
          s.title,
          s.description,
          datetime(s.updated_at) || 'Z' as updated_at,
          s.user_id,
          s.is_public,
          s.is_pinned,
          s.is_favorite,
          s.edit_permission,
          u.username,
          GROUP_CONCAT(DISTINCT c.name) as categories,
          (SELECT COUNT(*) FROM shared_snippets WHERE snippet_id = s.id) as share_count
        FROM snippets s
        LEFT JOIN categories c ON s.id = c.snippet_id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ? AND s.expiry_date IS NULL
        GROUP BY s.id
        ORDER BY s.updated_at DESC
      `);

      this.selectPublicStmt = db.prepare(`
        SELECT 
          s.id,
          s.title,
          s.description,
          datetime(s.updated_at) || 'Z' as updated_at,
          s.user_id,
          s.is_public,
          s.is_pinned,
          s.is_favorite,
          s.edit_permission,
          u.username,
          GROUP_CONCAT(DISTINCT c.name) as categories,
          (SELECT COUNT(*) FROM shared_snippets WHERE snippet_id = s.id) as share_count
        FROM snippets s
        LEFT JOIN categories c ON s.id = c.snippet_id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.is_public = 1 AND s.expiry_date IS NULL 
        GROUP BY s.id
        ORDER BY s.updated_at DESC
      `);

      this.insertSnippetStmt = db.prepare(`
        INSERT INTO snippets (
          title, 
          description, 
          updated_at,
          expiry_date,
          user_id,
          is_public,
          edit_permission
        ) VALUES (?, ?, datetime('now', 'utc'),NULL, ?, ?, ?)
      `);

      this.insertFragmentStmt = db.prepare(`
        INSERT INTO fragments (
          snippet_id,
          file_name,
          code,
          language,
          position
        ) VALUES (?, ?, ?, ?, ?)
      `);

      this.insertCategoryStmt = db.prepare(`
        INSERT INTO categories (snippet_id, name) VALUES (?, ?)
      `);

      this.updateSnippetStmt = db.prepare(`
        UPDATE snippets 
        SET title = ?, 
            description = ?,
            updated_at = datetime('now', 'utc'),
            is_public = ?,
            edit_permission = ?
        WHERE id = ?
      `);

      this.restoreSnippetStmt = db.prepare(`
        UPDATE snippets
        SET expiry_date = NULL
        WHERE id = ? AND user_id = ?
      `);

      this.deleteFragmentsStmt = db.prepare(`
        DELETE FROM fragments WHERE snippet_id = ?
      `);

      this.deleteCategoriesStmt = db.prepare(`
        DELETE FROM categories WHERE snippet_id = ?
      `);

      this.selectAllDeletedStmt = db.prepare(`
        SELECT 
          s.id,
          s.title,
          s.description,
          datetime(s.updated_at) || 'Z' as updated_at,
          datetime(s.expiry_date) || 'Z' as expiry_date,
          s.user_id,
          s.is_public,
          s.is_pinned,
          s.is_favorite,
          s.edit_permission,
          u.username,
          GROUP_CONCAT(DISTINCT c.name) as categories,
          (SELECT COUNT(*) FROM shared_snippets WHERE snippet_id = s.id) as share_count
        FROM snippets s
        LEFT JOIN categories c ON s.id = c.snippet_id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ? AND s.expiry_date IS NOT NULL
        GROUP BY s.id
        ORDER BY s.updated_at DESC
      `);

      this.deleteExpiredSnippetsStmt = db.prepare(`
        DELETE FROM snippets
        WHERE expiry_date IS NOT NULL AND datetime(expiry_date) <= datetime(?, 'utc')
      `);

      this.selectByIdStmt = db.prepare(`
        SELECT 
          s.id,
          s.title,
          s.description,
          datetime(s.updated_at) || 'Z' as updated_at,
          s.user_id,
          s.is_public,
          s.is_pinned,
          s.is_favorite,
          s.edit_permission,
          u.username,
          GROUP_CONCAT(DISTINCT c.name) as categories,
          (SELECT COUNT(*) FROM shared_snippets WHERE snippet_id = s.id) as share_count
        FROM snippets s
        LEFT JOIN categories c ON s.id = c.snippet_id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND (s.user_id = ? OR s.is_public = 1 OR ${SHARED_WITH_VIEWER_SQL}) AND s.expiry_date IS NULL
        GROUP BY s.id
      `);

      this.selectPublicByIdStmt = db.prepare(`
        SELECT 
          s.id,
          s.title,
          s.description,
          datetime(s.updated_at) || 'Z' as updated_at,
          s.user_id,
          s.is_public,
          s.is_pinned,
          s.is_favorite,
          s.edit_permission,
          u.username,
          GROUP_CONCAT(DISTINCT c.name) as categories,
          (SELECT COUNT(*) FROM shared_snippets WHERE snippet_id = s.id) as share_count
        FROM snippets s
        LEFT JOIN categories c ON s.id = c.snippet_id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.is_public = TRUE AND s.expiry_date IS NULL
        GROUP BY s.id
      `);

      this.moveToRecycleBinStmt = db.prepare(`
        UPDATE snippets
        SET expiry_date = datetime('now', '+30 days')
        WHERE id = ? AND user_id = ?
      `);

      this.deleteSnippetStmt = db.prepare(`
        DELETE FROM snippets 
        WHERE id = ? AND user_id = ?
        RETURNING *                            
      `); // returns the deleted snippet

      this.selectFragmentsStmt = db.prepare(`
        SELECT id, file_name, code, language, position 
        FROM fragments
        WHERE snippet_id = ?
        ORDER BY position
      `);

      this.setPinnedStmt = db.prepare(`
        UPDATE snippets
        SET is_pinned = ?
        WHERE id = ? AND user_id = ?
      `);

      this.selectSharesStmt = db.prepare(`
        SELECT sh.group_id, sh.user_id, sh.permission, g.name as group_name, u.username
        FROM snippet_shares sh
        LEFT JOIN user_groups g ON sh.group_id = g.id
        LEFT JOIN users u ON sh.user_id = u.id
        WHERE sh.snippet_id = ?
        ORDER BY sh.group_id IS NULL, COALESCE(g.name, u.username) COLLATE NOCASE
      `);

      this.deleteSharesStmt = db.prepare(`
        DELETE FROM snippet_shares WHERE snippet_id = ?
      `);

      this.insertShareStmt = db.prepare(`
        INSERT INTO snippet_shares (snippet_id, group_id, user_id, permission) VALUES (?, ?, ?, ?)
      `);

      this.setFavoriteStmt = db.prepare(`
        UPDATE snippets
        SET is_favorite = ?
        WHERE id = ? AND user_id = ?
      `);
    }
  }

  #processSnippet(snippet) {
    if (!snippet) return null;

    const fragments = this.selectFragmentsStmt.all(snippet.id);
    const shares = this.selectSharesStmt.all(snippet.id).map((row) =>
      row.group_id
        ? { type: "group", id: row.group_id, name: row.group_name, permission: row.permission }
        : { type: "user", id: row.user_id, name: row.username, permission: row.permission }
    );
    snippet = { ...snippet, shares };

    return {
      ...snippet,
      categories: snippet.categories ? snippet.categories.split(",") : [],
      fragments: fragments.sort((a, b) => a.position - b.position),
      share_count: snippet.share_count || 0,
      visibility: getVisibility(snippet),
    };
  }

  // shares: [{ type: "group" | "user", id, permission: "view" | "edit" }]; replaces all existing shares.
  #replaceShares(snippetId, shares) {
    this.deleteSharesStmt.run(snippetId);
    for (const share of shares) {
      this.insertShareStmt.run(
        snippetId,
        share.type === "group" ? share.id : null,
        share.type === "user" ? share.id : null,
        share.permission === "edit" ? "edit" : "view"
      );
    }
  }

  findAll(userId) {
    this.#initializeStatements();
    try {
      const snippets = this.selectAllStmt.all(userId);
      return snippets.map(this.#processSnippet.bind(this));
    } catch (error) {
      Logger.error("Error in findAll:", error);
      throw error;
    }
  }

  findAllPublic() {
    this.#initializeStatements();
    try {
      const snippets = this.selectPublicStmt.all();
      return snippets.map(this.#processSnippet.bind(this));
    } catch (error) {
      Logger.error("Error in findAllPublic:", error);
      throw error;
    }
  }

  create({
    title,
    description,
    categories = [],
    fragments = [],
    userId,
    isPublic = 0,
    shares = [],
    editPermission = "owner",
  }) {
    this.#initializeStatements();
    try {
      const db = getDb();

      return db.transaction(() => {
        const insertResult = this.insertSnippetStmt.run(
          title,
          description,
          userId,
          isPublic ? 1 : 0,
          editPermission
        );
        const snippetId = insertResult.lastInsertRowid;
        this.#replaceShares(snippetId, isPublic ? [] : shares);

        fragments.forEach((fragment, index) => {
          this.insertFragmentStmt.run(
            snippetId,
            fragment.file_name || `file${index + 1}`,
            fragment.code || "",
            fragment.language || "plaintext",
            fragment.position || index
          );
        });

        if (categories.length > 0) {
          for (const category of categories) {
            if (category.trim()) {
              this.insertCategoryStmt.run(
                snippetId,
                category.trim().toLowerCase()
              );
            }
          }
        }

        const created = this.selectByIdStmt.get(snippetId, userId, userId, userId);
        return this.#processSnippet(created);
      })();
    } catch (error) {
      Logger.error("Error in create:", error);
      throw error;
    }
  }

  update(
    id,
    { title, description, categories = [], fragments = [], isPublic = 0, shares, editPermission = "owner" },
    userId
  ) {
    this.#initializeStatements();
    try {
      const db = getDb();

      return db.transaction(() => {
        // Callers must check edit permission first (see SnippetService.updateSnippet).
        const result = this.updateSnippetStmt.run(
          title,
          description,
          isPublic ? 1 : 0,
          editPermission,
          id
        );
        if (result.changes === 0) return null;
        // shares undefined: leave sharing untouched (e.g. edits by a share editor)
        if (isPublic) this.#replaceShares(id, []);
        else if (shares) this.#replaceShares(id, shares);

        this.deleteFragmentsStmt.run(id);
        fragments.forEach((fragment, index) => {
          this.insertFragmentStmt.run(
            id,
            fragment.file_name || `file${index + 1}`,
            fragment.code || "",
            fragment.language || "plaintext",
            fragment.position || index
          );
        });

        this.deleteCategoriesStmt.run(id);
        for (const category of categories) {
          if (category.trim()) {
            this.insertCategoryStmt.run(id, category.trim().toLowerCase());
          }
        }

        const updated = this.selectByIdStmt.get(id, userId, userId, userId);
        return this.#processSnippet(updated);
      })();
    } catch (error) {
      Logger.error("Error in update:", error);
      throw error;
    }
  }

  restore(id, userId) {
    this.#initializeStatements();
    try {
      const db = getDb();
      return db.transaction(() => {
        this.restoreSnippetStmt.run(id, userId);
      })();
    } catch (error) {
      Logger.error("Error in restore:", error);
      throw error;
    }
  }

  moveToRecycle(id, userId) {
    this.#initializeStatements();
    try {
      const db = getDb();
      return db.transaction(() => {
        const snippet = this.selectByIdStmt.get(id, userId, userId, userId);
        if (snippet && snippet.user_id === userId) {
          this.moveToRecycleBinStmt.run(id, userId);
          return this.#processSnippet(snippet);
        }
        return null;
      })();
    } catch (error) {
      Logger.error("Error in moving to recycle:", error);
      throw error;
    }
  }

  findAllDeleted(userId) {
    this.#initializeStatements();
    try {
      const deletedSnippets = this.selectAllDeletedStmt.all(userId);
      return deletedSnippets.map(this.#processSnippet.bind(this));
    } catch (error) {
      Logger.error("Error in findAllDeleted:", error);
      throw error;
    }
  }

  delete(id, userId) {
    this.#initializeStatements();
    try {
      const db = getDb();

      return db.transaction(() => {
        const deletedSnippet = this.deleteSnippetStmt.get(id, userId); // get() will return deleted row
        return deletedSnippet ? this.#processSnippet(deletedSnippet) : null;
      })();
    } catch (error) {
      Logger.error("Error in delete:", error);
      throw error;
    }
  }

  deleteExpired() {
    this.#initializeStatements();
    try {
      const db = getDb();
      const currentTime = new Date().toISOString();
      db.transaction(() => {
        this.deleteExpiredSnippetsStmt.run(currentTime);
      })();
    } catch (error) {
      Logger.error("Error in deleteExpired:", error);
      throw error;
    }
  }

  findById(id, userId = null) {
    // userId given: owner, public, or someone it is shared with can read it.
    this.#initializeStatements();
    try {
      if (userId != null) {
        const snippet = this.selectByIdStmt.get(id, userId, userId, userId);
        return this.#processSnippet(snippet);
      }

      const snippet = this.selectPublicByIdStmt.get(id);
      return this.#processSnippet(snippet);
    } catch (error) {
      Logger.error("Error in findById:", error);
      throw error;
    }
  }

  setPinned(id, value, userId) {
    this.#initializeStatements();
    try {
      const result = this.setPinnedStmt.run(value ? 1 : 0, id, userId);
      if (result.changes === 0) return null;
      const updated = this.selectByIdStmt.get(id, userId, userId, userId);
      return this.#processSnippet(updated);
    } catch (error) {
      Logger.error("Error in setPinned:", error);
      throw error;
    }
  }

  setFavorite(id, value, userId) {
    this.#initializeStatements();
    try {
      const result = this.setFavoriteStmt.run(value ? 1 : 0, id, userId);
      if (result.changes === 0) {
        return null;
      }
      const updated = this.selectByIdStmt.get(id, userId, userId, userId);
      return this.#processSnippet(updated);
    } catch (error) {
      Logger.error("Error in setFavorite:", error);
      throw error;
    }
  }

  findAllPaginated({
    userId = null,
    viewerId = null,
    sharedViewerId = null,
    filters = {},
    sort = 'newest',
    limit = 50,
    offset = 0
  }) {
    this.#initializeStatements();

    try {
      // Build base query
      let sql = `
        SELECT
          s.id,
          s.title,
          s.description,
          datetime(s.updated_at) || 'Z' as updated_at,
          CASE WHEN s.expiry_date IS NOT NULL THEN datetime(s.expiry_date) || 'Z' ELSE NULL END as expiry_date,
          s.user_id,
          s.is_public,
          s.is_pinned,
          s.is_favorite,
          s.edit_permission,
          u.username,
          GROUP_CONCAT(DISTINCT c.name) as categories,
          (SELECT COUNT(*) FROM shared_snippets WHERE snippet_id = s.id) as share_count,
          COUNT(*) OVER() as total_count
        FROM snippets s
        LEFT JOIN categories c ON s.id = c.snippet_id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1
      `;

      const params = [];

      // Apply filters dynamically
      const scope = scopeFilter({ userId, viewerId, sharedViewerId });
      sql += ` AND ${scope.sql}`;
      params.push(...scope.params);
      if (sharedViewerId != null && filters.groupId) {
        sql += ` AND EXISTS (SELECT 1 FROM snippet_shares sh WHERE sh.snippet_id = s.id AND sh.group_id = ?)`;
        params.push(filters.groupId);
      }

      if (filters.recycled) {
        sql += ` AND s.expiry_date IS NOT NULL`;
      } else {
        sql += ` AND s.expiry_date IS NULL`;
      }

      if (filters.favorites) {
        sql += ` AND s.is_favorite = 1`;
      }

      if (filters.pinned) {
        sql += ` AND s.is_pinned = 1`;
      }

      if (filters.search) {
        sql += ` AND (s.title LIKE ? OR s.description LIKE ?`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);

        if (filters.searchCode) {
          sql += ` OR EXISTS (
            SELECT 1 FROM fragments f
            WHERE f.snippet_id = s.id AND f.code LIKE ?
          )`;
          params.push(`%${filters.search}%`);
        }
        sql += `)`;
      }

      if (filters.language) {
        sql += ` AND EXISTS (
          SELECT 1 FROM fragments f
          WHERE f.snippet_id = s.id AND f.language = ?
        )`;
        params.push(filters.language);
      }

      sql += ` GROUP BY s.id`;

      // Category AND logic: must have ALL selected categories
      if (filters.categories && filters.categories.length > 0) {
        sql += ` HAVING COUNT(DISTINCT CASE WHEN c.name IN (${filters.categories.map(() => '?').join(',')}) THEN c.name END) = ?`;
        params.push(...filters.categories, filters.categories.length);
      }

      // Apply sorting - pinned snippets always come first
      sql += ` ORDER BY s.is_pinned DESC, `;
      switch (sort) {
        case 'oldest':
          sql += `s.updated_at ASC`;
          break;
        case 'alpha-asc':
          sql += `s.title ASC`;
          break;
        case 'alpha-desc':
          sql += `s.title DESC`;
          break;
        case 'newest':
        default:
          sql += `s.updated_at DESC`;
      }

      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const db = getDb();
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params);

      const total = rows.length > 0 ? rows[0].total_count : 0;
      const snippets = rows.map(this.#processSnippet.bind(this));

      return { snippets, total };
    } catch (error) {
      Logger.error("Error in findAllPaginated:", error);
      throw error;
    }
  }

  getMetadata(userId = null, viewerId = null, sharedViewerId = null) {
    this.#initializeStatements();
    const db = getDb();

    try {
      const scope = scopeFilter({ userId, viewerId, sharedViewerId });

      // Get unique categories
      const facets = getCategoryFacets(db, userId, viewerId, sharedViewerId);
      const categories = facets.map((facet) => facet.value);

      // Get unique languages
      let languageSql = `
        SELECT DISTINCT f.language
        FROM fragments f
        INNER JOIN snippets s ON f.snippet_id = s.id
        WHERE s.expiry_date IS NULL
      `;
      const languageParams = [];

      languageSql += ` AND ${scope.sql}`;
      languageParams.push(...scope.params);
      languageSql += ` ORDER BY f.language`;

      const languages = db.prepare(languageSql).all(...languageParams).map(r => r.language);

      // Get counts
      let countSql = `SELECT COUNT(*) as count FROM snippets s WHERE s.expiry_date IS NULL`;
      const countParams = [];

      countSql += ` AND ${scope.sql}`;
      countParams.push(...scope.params);

      const total = db.prepare(countSql).get(...countParams).count;

      return { categories, languages, counts: { total }, facets };
    } catch (error) {
      Logger.error("Error in getMetadata:", error);
      throw error;
    }
  }
}

export default new SnippetRepository();
