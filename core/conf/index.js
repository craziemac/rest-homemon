var tool = require('cloneextend'),
    conf = {};
    conf.production = {
        db:             {
            mysql:          {
                host        : 'localhost',
                user        : 'raspidev',
                password    : '',
                database    : 'RaspberryPiDev'
            }
        },
        application:    {
            errorHandler: {},
            username    : 'demo',
            password    : 'Que62msjiDU0b2yYvi2zbavw'
        },
        server:         {
            port        : '80'
        }
    };
    conf.development = {
        db:             {
            mysql:          {
                host        : 'localhost',
                user        : 'raspidev',
                password    : '',
                database    : 'RaspberryPiDev'
            }
        },
        application:    {
            errorHandler: { dumpExceptions: true, showStack: true }
        }
    };
    conf.defaults = {
        application:    {
            salt        : '1234567890QWERTY',
            username    : 'marcus',
            password    : 'dnEorVXvEsJgjaP1D9QkxA==',
            realm       : 'Authenticated',
            routes      : ['sensor']
        },
        server:         {
            host        : 'localhost',
            port        : 3000
        }
    };

exports.get = function get(env, obj){
    var settings = tool.cloneextend(conf.defaults, conf[env]);
    return ('object' === typeof obj) ? tool.cloneextend(settings, obj) : settings;
}