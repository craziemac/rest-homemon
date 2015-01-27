
exports.setup = function setup(app, conf){
    var mysql   = require('mysql');
    var express = require('express');
    var pool    = mysql.createPool({
            host     : conf.db.mysql.host,
            user     : conf.db.mysql.user,
            password : conf.db.mysql.password,
            database : conf.db.mysql.database
        });
    var compress = require('compression');
    var morgan = require('morgan');
    var bodyParser = require('body-parser');
    var errorhandler = require('errorhandler');

/*    conf.application.middleware.forEach(function(val){
        app.use(express[val]());
    });*/
    app.use(compress());
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(errorhandler(conf.application.errorHandler));
    app.use(function(req, res, next) {
        req.mysql   = pool;
        req.cache   = require('memoizee');
        req.store   = app.locals;
        next();
    });
};