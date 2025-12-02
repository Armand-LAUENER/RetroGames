import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { initDatabase } from './config/database.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Initialization
initDatabase();

// Route Registration
app.use('/api/users', userRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running with SQLite',
    database: 'Connected',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('\n==================================================');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: SQLite (arcade_game.db)`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📝 Test health: http://localhost:${PORT}/api/health`);
  console.log('==================================================\n');
});

// Graceful Shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('\n👋 Server stopped successfully');
  process.exit(0);
});