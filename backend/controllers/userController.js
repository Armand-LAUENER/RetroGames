import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Inscription
export const register = async (req, res) => {
  try {
    const { email, pseudo, password, color } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = db.prepare(
      'SELECT * FROM users WHERE email = ? OR pseudo = ?'
    ).get(email, pseudo);

    if (existingUser) {
      return res.status(400).json({
        message: 'Email ou pseudo déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur
    const insertUser = db.prepare(
      'INSERT INTO users (email, pseudo, password, color) VALUES (?, ?, ?, ?)'
    );

    const result = insertUser.run(email, pseudo, hashedPassword, color || '#FF6B6B');
    const userId = result.lastInsertRowid;

    // Créer les stats utilisateur
    db.prepare('INSERT INTO user_stats (user_id) VALUES (?)').run(userId);

    // Générer le token
    const token = generateToken(userId);

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: userId,
        email,
        pseudo,
        color: color || '#FF6B6B'
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

// Connexion
export const login = async (req, res) => {
  try {
    const { pseudo, password } = req.body;

    // Trouver l'utilisateur
    const user = db.prepare('SELECT * FROM users WHERE pseudo = ?').get(pseudo);

    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Mettre à jour last_login
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    // Générer le token
    const token = generateToken(user.id);

    // Retirer le mot de passe
    delete user.password;

    res.json({
      message: 'Connexion réussie',
      token,
      user
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

// Obtenir tous les utilisateurs (public)
export const getAllUsers = async (req, res) => {
  try {
    const users = db.prepare(
      'SELECT id, pseudo, color, high_score, games_played, created_at FROM users ORDER BY high_score DESC'
    ).all();

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

// Obtenir le profil (protégé)
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = db.prepare(
      'SELECT id, email, pseudo, color, games_played, high_score, created_at, last_login FROM users WHERE id = ?'
    ).get(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
};

// Démarrer une partie
export const startGame = async (req, res) => {
  try {
    const userId = req.user.id;

    const insertSession = db.prepare(
      'INSERT INTO game_sessions (user_id) VALUES (?)'
    );

    const result = insertSession.run(userId);
    const sessionId = result.lastInsertRowid;

    res.json({
      message: 'Partie démarrée',
      sessionId,
      startedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Start games error:', error);
    res.status(500).json({ message: 'Erreur lors du démarrage de la partie' });
  }
};

// Mettre à jour le score
export const updateScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, score, duration } = req.body;

    // Mettre à jour la session
    db.prepare(
      'UPDATE game_sessions SET score = ?, duration = ? WHERE id = ? AND user_id = ?'
    ).run(score, duration, sessionId, userId);

    // Récupérer le high score actuel
    const user = db.prepare('SELECT high_score, games_played FROM users WHERE id = ?').get(userId);

    // Mettre à jour les stats utilisateur
    const newGamesPlayed = user.games_played + 1;
    const newHighScore = Math.max(user.high_score, score);

    db.prepare(
      'UPDATE users SET games_played = ?, high_score = ? WHERE id = ?'
    ).run(newGamesPlayed, newHighScore, userId);

    // Mettre à jour user_stats
    const allScores = db.prepare(
      'SELECT score FROM game_sessions WHERE user_id = ?'
    ).all(userId);

    const totalPlaytime = db.prepare(
      'SELECT SUM(duration) as total FROM game_sessions WHERE user_id = ?'
    ).get(userId).total || 0;

    const averageScore = allScores.length > 0
      ? allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length
      : 0;

    db.prepare(
      'UPDATE user_stats SET total_playtime = ?, average_score = ? WHERE user_id = ?'
    ).run(totalPlaytime, averageScore, userId);

    res.json({
      message: 'Score enregistré',
      score,
      highScore: newHighScore,
      isNewHighScore: score > user.high_score
    });

  } catch (error) {
    console.error('❌ Update score error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement du score' });
  }
};

// Obtenir les statistiques
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = db.prepare(
      'SELECT pseudo, color, high_score, games_played FROM users WHERE id = ?'
    ).get(userId);

    const stats = db.prepare(
      'SELECT * FROM user_stats WHERE user_id = ?'
    ).get(userId);

    const recentGames = db.prepare(
      'SELECT score, duration, played_at FROM game_sessions WHERE user_id = ? ORDER BY played_at DESC LIMIT 10'
    ).all(userId);

    res.json({
      success: true,
      user,
      stats: {
        ...stats,
        achievements: JSON.parse(stats.achievements || '[]')
      },
      recentGames
    });

  } catch (error) {
    console.error('❌ Get user stats error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};

// Obtenir le leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const leaderboard = db.prepare(
      `SELECT 
        id,
        pseudo, 
        color, 
        high_score, 
        games_played,
        created_at
       FROM users 
       ORDER BY high_score DESC, games_played DESC
       LIMIT ?`
    ).all(limit);

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error('❌ Get leaderboard error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du classement' });
  }
};
