import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers la base de données
const dbPath = path.join(__dirname, '..', 'arcade_game.db');

// Créer/ouvrir la base de données
const db = new Database(dbPath, { verbose: console.log });

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

// Initialiser les tables
export function initDatabase() {
  console.log('🗄️  Initializing SQLite database...');

  // Table users
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
    )
  `);

  // Index pour les recherches rapides
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_pseudo ON users(pseudo);
  `);

  // Table game_sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 0,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Table user_stats
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      total_playtime INTEGER DEFAULT 0,
      average_score REAL DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      achievements TEXT DEFAULT '[]',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database tables created successfully');
}

// Exporter la base de données
export default db;
