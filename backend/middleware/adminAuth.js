const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  // Try to get token from Authorization header or x-admin-key header
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-admin-key');
  
  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.adminId = decoded.adminId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = adminAuth;
