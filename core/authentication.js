var basicAuth = require('basic-auth');
var crypto  = require('crypto');

/**
 * Simple basic auth middleware for use with Express 4.x.
 *
 * @example
 * app.use('/api-requiring-auth', utils.basicAuth('username', 'password'));
 *
 * @param   {string}   username Expected username
 * @param   {string}   password Expected password
 * @returns {function} Express 4 middleware requiring the given credentials
 */
/*
exports.basicAuth = function(username, password, conf, crypto) {
  return function(req, res, next) {
    var user = basicAuth(req);

    if (!user || user.name !== username || user.pass !== password) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.send(401);
    }

    next();
  };
};
*/

exports.basicAuth = function(conf) {
    return function(req, res, next) {
        var user = basicAuth(req);
        if (!user) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        }
        var cipher = crypto.createCipher('aes-256-cbc', conf.application.salt);
        cipher.update(user.pass, 'utf8', 'base64');
console.log('password %s username %s', cipher.final('base64'), user.name);

        if (!user || !(cipher.final('base64') === conf.application.password) && user.name === conf.application.username ) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        }
        
        next();
    };
};
