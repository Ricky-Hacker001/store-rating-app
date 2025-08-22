module.exports = function(req, res, next) {
  if (req.user && req.user.role === 'store_owner') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Store Owner role required.' });
  }
};