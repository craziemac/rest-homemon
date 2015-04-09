var basicAuth = require('basic-auth');
var crypto  = require('crypto');

exports.basicAuth = function(conf) {
    return function(req, res, next) {
        console.log('%s', req.headers.authorization);
        var user = basicAuth(req);
        if (!user) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        }
        var cipher = crypto.createCipher('aes-256-cbc', conf.application.salt);
        cipher.update(user.pass, 'utf8', 'base64');
/*console.log('password %s username %s', cipher.final('base64'), user.name);*/

        if (!user || !(cipher.final('base64') === conf.application.password) && user.name === conf.application.username ) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        }
        
        next();
    };
};
