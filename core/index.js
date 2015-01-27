exports.init = function init(){
    var router  = require('./router');
    var middleware  = require('./middleware');
    var express = require('express');
    var app     = express();
    var conf    = require('./conf').get(process.env.NODE_ENV);
    var auth = require('./authentication').basicAuth(conf);

    middleware.setup(app, conf);
    router.run(auth, app, conf.application.routes);

    app.listen(conf.server.port);
    console.log('node-rest-demo pid %s listening on %d in %s', process.pid, conf.server.port, process.env.NODE_ENV);
};