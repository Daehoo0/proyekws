const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verifyToken = async (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ status: 401, message: 'Access Denied. No token provided.' });
  }

  const actualToken = token.replace('Bearer ', '');

  try {
    const verified = jwt.verify(actualToken, process.env.JWT_SECRET);
    const user = await User.findByPk(verified.id);

    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(400).json({ status: 400, message: 'Invalid Token' });
  }
};

module.exports = { verifyToken };
