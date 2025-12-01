import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false, // J'ai ajouté success: false pour être cohérent
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- CORRECTION ICI ---
    // 1. On utilise decoded.id (car le token a été signé avec 'id')
    // 2. On crée un objet req.user pour que les contrôleurs puissent faire req.user.id
    req.user = { id: decoded.id };
    // ----------------------

    next();
  } catch (error) {
    console.error('Auth error:', error.message); // Utile pour le débogage
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};