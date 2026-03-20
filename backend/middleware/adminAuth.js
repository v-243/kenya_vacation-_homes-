const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }

  return process.env.JWT_SECRET;
};

const adminAuth = (req, res, next) => {
  // Try to get token from Authorization header or x-admin-key header
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-admin-key');
  
  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.adminId = decoded.adminId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = adminAuth;
