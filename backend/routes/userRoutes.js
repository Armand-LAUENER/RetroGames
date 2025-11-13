import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  getAllUsers,
  startGame,
  updateScore
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('pseudo').isLength({ min: 3, max: 50 }).withMessage('Pseudo must be between 3 and 50 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('color').matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format')
];

const loginValidation = [
  body('pseudo').notEmpty().withMessage('Pseudo is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes publiques
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/users', getAllUsers);

// Routes protégées
router.get('/profile', authenticate, getProfile);
router.post('/game/start', authenticate, startGame);
router.post('/game/score', authenticate, updateScore);

export default router;
