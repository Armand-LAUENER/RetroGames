import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Créer un utilisateur
  static async create({ email, pseudo, password, color }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.execute(
        'INSERT INTO users (email, pseudo, password, color) VALUES (?, ?, ?, ?)',
        [email, pseudo, hashedPassword, color]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Trouver par email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Trouver par pseudo
  static async findByPseudo(pseudo) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE pseudo = ?',
        [pseudo]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Trouver par ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, email, pseudo, color, created_at, games_played, high_score, last_login FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtenir tous les utilisateurs
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, pseudo, email, color, created_at, games_played, high_score FROM users ORDER BY high_score DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Vérifier le mot de passe
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Mettre à jour last_login
  static async updateLastLogin(userId) {
    try {
      await pool.execute(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [userId]
      );
    } catch (error) {
      throw error;
    }
  }

  // Incrémenter games_played
  static async incrementGamesPlayed(userId) {
    try {
      await pool.execute(
        'UPDATE users SET games_played = games_played + 1 WHERE id = ?',
        [userId]
      );
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour le high score
  static async updateHighScore(userId, score) {
    try {
      await pool.execute(
        'UPDATE users SET high_score = ? WHERE id = ? AND high_score < ?',
        [score, userId, score]
      );
    } catch (error) {
      throw error;
    }
  }
}

export default User;
