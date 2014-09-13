var path = require('path');

var config = {

    root : path.join(__dirname, '..'),

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
