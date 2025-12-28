const jwt = require('jsonwebtoken');

function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    appPermissions: user.appPermissions
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
