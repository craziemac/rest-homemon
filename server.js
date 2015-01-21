var core = require('./core');

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});

core.init();


/*var express = require('express');
var app = express();
var mysql = require('mysql');
var config_db = require(./settings/config_database);
var config_srv = require(./settings/config_server);

var connectionpool = mysql.createPool({
    host = config_db.host,
    user = config_db.user,
    password = config_db.pass,
    database = config_db.name
    });



var Sequelize = require('sequelize');

sequelize = new Sequelize(config.db_name, config.db_user, config.db_pass, {
    dialect: config.db_dialect,
    host: config.db_host,
    port: config.db_port,
});
 
sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err)
    } else {
      console.log('Connection has been established successfully.')
    }
  });
*/
