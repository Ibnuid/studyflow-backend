const protect = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authorized, please login' });
  }
  next();
};

module.exports = { protect };