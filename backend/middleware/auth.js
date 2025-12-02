import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate requests using JWT.
 * Verifies the token from the Authorization header and attaches the user payload to the request.
 * * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticate = (req, res, next) => {
  try {
    // Retrieve token from "Authorization: Bearer <token>" header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing authentication token' });
    }

    // Verify the token validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user ID to the request object for downstream controllers
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};