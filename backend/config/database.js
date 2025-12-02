import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the SQLite database file
const dbPath = path.join(__dirname, '..', 'arcade_game.db');

// Initialize the database with verbose logging for debugging purposes
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign key constraints enforcement
db.pragma('foreign_keys = ON');

/**
 * Initializes the database schema.
 * Creates necessary tables if they do not exist.
 */
export function initDatabase() {
  console.log('🗄️  Initializing SQLite database...');

  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      pseudo TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      color TEXT DEFAULT '#FF6B6B',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      games_played INTEGER DEFAULT 0,
      high_score INTEGER DEFAULT 0,
      last_login DATETIME
    );
  `);

  // 2. User Scores Table (High scores per game)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_scores (
      user_id INTEGER,
      game_id TEXT NOT NULL,
      best_score INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, game_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Game Sessions Table (History of played games)
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      game_id TEXT,
      score INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 0,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Migration: Add game_id column to game_sessions if it's missing
  try {
    const columns = db.prepare("PRAGMA table_info(game_sessions)").all();
    const hasGameId = columns.some(col => col.name === 'game_id');

    if (!hasGameId) {
      console.log('🔄 Migration: Adding game_id column...');
      db.exec("ALTER TABLE game_sessions ADD COLUMN game_id TEXT");
    }
  } catch (error) {
    // Ignore error if table creation failed earlier
  }

  console.log('✅ Database is ready!');
}

export default db;