const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('x-auth-token').replace('Bearer ', '');

  if (!token) return res.status(401).json({ status: 401, message: 'Access Denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ status: 400, message: 'Invalid token.' });
  }
};

module.exports = { verifyToken };
