import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    // Récupérer le token du header "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attacher l'utilisateur à la requête
    // IMPORTANT : On utilise 'id' car c'est ainsi qu'on l'a signé dans userController
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token invalide' });
  }
};