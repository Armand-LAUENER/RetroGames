import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import db from '../config/database.js';

/**
 * Generates a JSON Web Token (JWT) for a user.
 * @param {number} userId - The ID of the user.
 * @returns {string} The signed JWT.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Registers a new user.
 * Handles password hashing and initial user creation.
 */
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { email, pseudo, password, color } = req.body;

    // Check if email or pseudo already exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ? OR pseudo = ?').get(email, pseudo);
    if (existing) return res.status(400).json({ message: 'Email or username already taken' });

    // Hash password before storage
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, pseudo, password, color) VALUES (?, ?, ?, ?)')
                     .run(email, pseudo, hashedPassword, color || '#FF6B6B');

    const userId = result.lastInsertRowid;
    const token = generateToken(userId);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, email, pseudo, color, highScore: 0, gamesPlayed: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Authenticates a user.
 * Verifies credentials and updates last login timestamp.
 */
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { pseudo, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE pseudo = ?').get(pseudo);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login timestamp
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    const token = generateToken(user.id);

    // Remove sensitive data before sending response
    delete user.password;

    // Normalize field names for frontend consistency
    user.highScore = user.high_score;
    user.gamesPlayed = user.games_played;

    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Login failed due to server error' });
  }
};

/**
 * Retrieves the current user's profile.
 */
export const getProfile = async (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, pseudo, color, games_played as gamesPlayed, high_score as highScore, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile' });
  }
};

/**
 * Initializes a new game session.
 */
export const startGame = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.body;

    if (!gameId) return res.status(400).json({ message: 'Game ID required' });

    const result = db.prepare('INSERT INTO game_sessions (user_id, game_id) VALUES (?, ?)')
                     .run(userId, gameId);

    res.json({ sessionId: result.lastInsertRowid });
  } catch (error) {
    console.error('Start Game Error:', error);
    res.status(500).json({ message: 'Failed to start game session' });
  }
};

/**
 * Updates the score for a specific game session.
 * Also updates global high scores and personal bests if applicable.
 */
export const updateScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, score, duration } = req.body;

    const session = db.prepare('SELECT game_id FROM game_sessions WHERE id = ?').get(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const gameId = session.game_id;

    // Update session details
    db.prepare('UPDATE game_sessions SET score = ?, duration = ? WHERE id = ?').run(score, duration, sessionId);

    // Check current personal best for this game
    const currentBest = db.prepare('SELECT best_score FROM user_scores WHERE user_id = ? AND game_id = ?').get(userId, gameId);
    const oldScore = currentBest ? currentBest.best_score : 0;

    // Upsert logic: Update only if the new score is strictly higher
    if (!currentBest || score > oldScore) {
      db.prepare(`
        INSERT INTO user_scores (user_id, game_id, best_score, updated_at) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, game_id) DO UPDATE SET 
        best_score = excluded.best_score,
        updated_at = CURRENT_TIMESTAMP
      `).run(userId, gameId, score);
    }

    // Recalculate global stats (sum of best scores across all games)
    const globalStats = db.prepare('SELECT SUM(best_score) as total FROM user_scores WHERE user_id = ?').get(userId);
    const newGlobalScore = globalStats.total || 0;

    db.prepare('UPDATE users SET games_played = games_played + 1, high_score = ? WHERE id = ?')
      .run(newGlobalScore, userId);

    res.json({ message: 'Score saved successfully', newHighScore: score > oldScore });
  } catch (error) {
    console.error('Score Update Error:', error);
    res.status(500).json({ message: 'Failed to save score' });
  }
};

/**
 * Retrieves the top 10 scores for a specific game.
 */
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
    res.status(500).json({ message: 'Error retrieving leaderboard' });
  }
};

/**
 * Retrieves the global leaderboard (Top 50 users).
 */
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
    res.status(500).json({ message: 'Error retrieving users' });
  }
};