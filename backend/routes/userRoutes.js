import express from 'express';
import rateLimit from 'express-rate-limit';
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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

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
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/users', getAllUsers);
router.get('/leaderboard/:gameId', getGameLeaderboard);

// Protected Routes (Require Authentication)
router.get('/profile', authenticate, getProfile);
router.post('/game/start', authenticate, startGame);
router.post('/game/score', authenticate, updateScore);

export default router;