var path = require('path');

var env = {
    development : {
        static : 'client'
    },
    production : {
        static : 'build/public'
    }
};

var config = {

    root : path.join(__dirname, '..'),

    env : env[process.env.NODE_ENV || 'development'],

    apiRoot : '/api',

    services : {
        soundcloud : {
            root : 'https://api.soundcloud.com',
            id : 'aa7cb478420de1cb1005e83fd46de08a',
            secret : '27b4fb157a288e0e78921c27c9fc84c8',
            user : 'jakelazaroff'
        }
    }
};

module.exports = config;
