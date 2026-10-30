import Logger from '../../logger.js';

function tableExists(db, name) {
  return (
    db
      .prepare(`SELECT COUNT(*) as count FROM sqlite_master WHERE type = 'table' AND name = ?`)
      .get(name).count > 0
  );
}

function columnExists(db, table, column) {
  return db
    .prepare(`SELECT COUNT(*) as count FROM pragma_table_info(?) WHERE name = ?`)
    .get(table, column).count > 0;
}

function needsMigration(db) {
  return (
    !tableExists(db, 'user_groups') ||
    !tableExists(db, 'user_group_members') ||
    !tableExists(db, 'user_group_invites') ||
    !tableExists(db, 'app_settings') ||
    !columnExists(db, 'snippets', 'group_id')
  );
}

export function up_v1_10_0_groups(db) {
  if (!needsMigration(db)) {
    Logger.debug('v1.10.0-groups - Migration not needed');
    return;
  }

  Logger.debug('v1.10.0-groups - Starting migration...');

  try {
    db.transaction(() => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS user_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_user_groups_name ON user_groups (name COLLATE NOCASE);

        CREATE TABLE IF NOT EXISTS user_group_members (
            group_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (group_id, user_id),
            FOREIGN KEY (group_id) REFERENCES user_groups (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_user_group_members_user_id ON user_group_members (user_id);

        CREATE TABLE IF NOT EXISTS user_group_invites (
            group_id INTEGER NOT NULL,
            email TEXT NOT NULL COLLATE NOCASE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (group_id, email),
            FOREIGN KEY (group_id) REFERENCES user_groups (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
      `);

      if (!columnExists(db, 'snippets', 'group_id')) {
        db.exec(`
          ALTER TABLE snippets ADD COLUMN group_id INTEGER DEFAULT NULL REFERENCES user_groups (id) ON DELETE SET NULL;
          CREATE INDEX IF NOT EXISTS idx_snippets_group_id ON snippets (group_id);
        `);
      }
    })();

    Logger.debug('v1.10.0-groups - Migration completed successfully');
  } catch (error) {
    Logger.error('v1.10.0-groups - Migration failed:', error);
    throw error;
  }
}
