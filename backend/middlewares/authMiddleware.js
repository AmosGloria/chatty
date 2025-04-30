const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Decode the token

    console.log('Decoded token:', decoded);  // Debugging token

    // Attach user info to the request
    req.user = { userId: decoded.userId };

    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(401).json({ error: 'You need to be logged in to create a channel.' });
  }
};

module.exports = authenticate;
