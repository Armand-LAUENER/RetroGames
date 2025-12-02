import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Inscription
export const register = async (req, res) => {
  try {
    const { email, pseudo, password, color } = req.body;
    const existing = db.prepare('SELECT * FROM users WHERE email = ? OR pseudo = ?').get(email, pseudo);
    if (existing) return res.status(400).json({ message: 'Email ou pseudo déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, pseudo, password, color) VALUES (?, ?, ?, ?)')
                     .run(email, pseudo, hashedPassword, color || '#FF6B6B');

    // Init stats
    const userId = result.lastInsertRowid;
    db.prepare('INSERT INTO user_stats (user_id) VALUES (?)').run(userId);

    const token = generateToken(userId);
    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: { id: userId, email, pseudo, color, highScore: 0, gamesPlayed: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Connexion
export const login = async (req, res) => {
  try {
    const { pseudo, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE pseudo = ?').get(pseudo);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    const token = generateToken(user.id);

    delete user.password;
    // Normalisation pour le frontend
    user.highScore = user.high_score;
    user.gamesPlayed = user.games_played;

    res.json({ message: 'Connexion réussie', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur connexion' });
  }
};

// Profil
export const getProfile = async (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, pseudo, color, games_played as gamesPlayed, high_score as highScore, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur profil' });
  }
};

// Démarrer une partie
export const startGame = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.body;

    if (!gameId) return res.status(400).json({ message: 'Game ID required' });

    const result = db.prepare('INSERT INTO game_sessions (user_id, game_id) VALUES (?, ?)')
                     .run(userId, gameId);

    res.json({ sessionId: result.lastInsertRowid });
  } catch (error) {
    console.error('Start Error:', error);
    res.status(500).json({ message: 'Erreur démarrage' });
  }
};

// Enregistrer le score
export const updateScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, score, duration } = req.body;

    const session = db.prepare('SELECT game_id FROM game_sessions WHERE id = ?').get(sessionId);
    if (!session) return res.status(404).json({ message: 'Session introuvable' });
    const gameId = session.game_id;

    db.prepare('UPDATE game_sessions SET score = ?, duration = ? WHERE id = ?').run(score, duration, sessionId);

    // Upsert du meilleur score par jeu
    const currentBest = db.prepare('SELECT best_score FROM user_scores WHERE user_id = ? AND game_id = ?').get(userId, gameId);
    const oldScore = currentBest ? currentBest.best_score : 0;

    // Si nouveau score >= ancien (permet d'enregistrer un 0 initial)
    if (!currentBest || score >= oldScore) {
      db.prepare(`
        INSERT INTO user_scores (user_id, game_id, best_score, updated_at) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, game_id) DO UPDATE SET 
        best_score = excluded.best_score,
        updated_at = CURRENT_TIMESTAMP
      `).run(userId, gameId, score);
    }

    // Mise à jour score global
    const globalStats = db.prepare('SELECT SUM(best_score) as total FROM user_scores WHERE user_id = ?').get(userId);
    const newGlobalScore = globalStats.total || 0;

    db.prepare('UPDATE users SET games_played = games_played + 1, high_score = ? WHERE id = ?')
      .run(newGlobalScore, userId);

    res.json({ message: 'Score saved', newHighScore: score > oldScore });
  } catch (error) {
    console.error('Score Error:', error);
    res.status(500).json({ message: 'Erreur sauvegarde score' });
  }
};

// Leaderboard d'un jeu spécifique
export const getGameLeaderboard = async (req, res) => {
  try {
    const { gameId } = req.params;
    const leaderboard = db.prepare(`
      SELECT u.pseudo, u.color, s.best_score as highScore
      FROM user_scores s
      JOIN users u ON s.user_id = u.id
      WHERE s.game_id = ?
      ORDER BY s.best_score DESC
      LIMIT 10
    `).all(gameId);

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Erreur leaderboard' });
  }
};

// Leaderboard Global (C'est cette fonction qui manquait à l'export !)
export const getAllUsers = async (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, pseudo, color, high_score as highScore, games_played as gamesPlayed 
      FROM users 
      ORDER BY high_score DESC 
      LIMIT 50
    `).all();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Erreur' });
  }
};