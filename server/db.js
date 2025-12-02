const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      done INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
  // Ensure `role` column exists on users (default 'user') - safe migration
  db.all("PRAGMA table_info(users)", [], (err, rows) => {
    if (err) return;
    const hasRole = rows && rows.some(r => r.name === 'role');
    if (!hasRole) {
      db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    }
  });
});

module.exports = db;
