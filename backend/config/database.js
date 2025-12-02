import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier .db
const dbPath = path.join(__dirname, '..', 'arcade_game.db');

// Options verbose pour voir les requêtes SQL dans la console (utile pour le debug)
const db = new Database(dbPath, { verbose: console.log });

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

export function initDatabase() {
  console.log('🗄️  Initialisation de la base de données SQLite...');

  // 1. Table Utilisateurs
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

  // 2. Table Scores par Jeu (NOUVEAU)
  // Attention aux virgules ici, c'est souvent la source d'erreurs
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

  // 3. Table Sessions de Jeu
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

  // MIGRATION DE SECOURS :
  // Si la table game_sessions existe déjà mais sans la colonne game_id, on l'ajoute.
  try {
    const columns = db.prepare("PRAGMA table_info(game_sessions)").all();
    const hasGameId = columns.some(col => col.name === 'game_id');

    if (!hasGameId) {
      console.log('🔄 Migration: Ajout de la colonne game_id...');
      db.exec("ALTER TABLE game_sessions ADD COLUMN game_id TEXT");
    }
  } catch (error) {
    // Ignore l'erreur si la table n'existe pas encore
  }

  console.log('✅ Base de données prête !');
}

export default db;