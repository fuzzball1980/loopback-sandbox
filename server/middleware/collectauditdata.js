module.exports = function() {
  return function setuser(req, res, next) {
    var loopback = require('loopback');
    
    if (!req.accessToken) {
      return next();
    }
    
    var User = req.app.models.user;
    User.findById(req.accessToken.userId, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(new Error('No user with this access token was found.'));
      }

      var loopbackContext = loopback.getCurrentContext();
      if (loopbackContext) {
        loopbackContext.set('currentUser', user);
        loopbackContext.set('remoteAddress', req.connection.remoteAddress);
        loopbackContext.set('xForwardedFor', req.headers["x-forwarded-for"]);
      }
      
      next();
    });
  };
};