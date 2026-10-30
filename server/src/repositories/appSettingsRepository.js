import { getDb } from '../config/database.js';
import { ALLOW_NEW_ACCOUNTS } from '../middleware/auth.js';

const ALLOW_NEW_ACCOUNTS_KEY = 'allow_new_accounts';

class AppSettingsRepository {
  get(key) {
    const row = getDb().prepare('SELECT value FROM app_settings WHERE key = ?').get(key);
    return row ? row.value : null;
  }

  set(key, value) {
    getDb()
      .prepare(`
        INSERT INTO app_settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `)
      .run(key, value);
  }

  // Admin choice from the UI wins; the ALLOW_NEW_ACCOUNTS env var is only the default.
  isRegistrationOpen() {
    const stored = this.get(ALLOW_NEW_ACCOUNTS_KEY);
    if (stored === null) return ALLOW_NEW_ACCOUNTS;
    return stored === 'true';
  }

  setRegistrationOpen(open) {
    this.set(ALLOW_NEW_ACCOUNTS_KEY, open ? 'true' : 'false');
  }
}

export default new AppSettingsRepository();
