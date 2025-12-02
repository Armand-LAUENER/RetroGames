import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  getAllUsers,
  startGame,
  updateScore,
  getGameLeaderboard
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation Rules
const registerValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('pseudo').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('color').matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format (Hex required)')
];

const loginValidation = [
  body('pseudo').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/users', getAllUsers);
router.get('/leaderboard/:gameId', getGameLeaderboard);

// Protected Routes (Require Authentication)
router.get('/profile', authenticate, getProfile);
router.post('/game/start', authenticate, startGame);
router.post('/game/score', authenticate, updateScore);

export default router;