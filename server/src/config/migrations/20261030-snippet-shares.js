import Logger from '../../logger.js';

function tableExists(db, name) {
  return (
    db
      .prepare(`SELECT COUNT(*) as count FROM sqlite_master WHERE type = 'table' AND name = ?`)
      .get(name).count > 0
  );
}

export function up_v1_10_0_snippet_shares(db) {
  if (tableExists(db, 'snippet_shares')) {
    Logger.debug('v1.10.0-snippet-shares - Migration not needed');
    return;
  }

  Logger.debug('v1.10.0-snippet-shares - Starting migration...');

  try {
    db.transaction(() => {
      db.exec(`
        CREATE TABLE snippet_shares (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            snippet_id INTEGER NOT NULL,
            group_id INTEGER DEFAULT NULL,
            user_id INTEGER DEFAULT NULL,
            permission TEXT NOT NULL DEFAULT 'view',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            CHECK ((group_id IS NULL) <> (user_id IS NULL)),
            FOREIGN KEY (snippet_id) REFERENCES snippets (id) ON DELETE CASCADE,
            FOREIGN KEY (group_id) REFERENCES user_groups (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        CREATE UNIQUE INDEX idx_snippet_shares_group ON snippet_shares (snippet_id, group_id) WHERE group_id IS NOT NULL;
        CREATE UNIQUE INDEX idx_snippet_shares_user ON snippet_shares (snippet_id, user_id) WHERE user_id IS NOT NULL;
        CREATE INDEX idx_snippet_shares_group_id ON snippet_shares (group_id);
        CREATE INDEX idx_snippet_shares_user_id ON snippet_shares (user_id);
      `);

      // Group-only snippets become a single group share; 'group' edit permission moves onto the share.
      db.exec(`
        INSERT INTO snippet_shares (snippet_id, group_id, permission)
        SELECT id, group_id, CASE WHEN edit_permission = 'group' THEN 'edit' ELSE 'view' END
        FROM snippets
        WHERE group_id IS NOT NULL AND is_public = 0;

        UPDATE snippets SET group_id = NULL WHERE group_id IS NOT NULL;
        UPDATE snippets SET edit_permission = 'owner' WHERE edit_permission = 'group';
      `);
    })();

    Logger.debug('v1.10.0-snippet-shares - Migration completed successfully');
  } catch (error) {
    Logger.error('v1.10.0-snippet-shares - Migration failed:', error);
    throw error;
  }
}
