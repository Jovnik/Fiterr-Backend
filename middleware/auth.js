
const ensureAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  } else {
    res.status(403).send('not authorized');
  }
}

module.exports = ensureAuthenticated;


