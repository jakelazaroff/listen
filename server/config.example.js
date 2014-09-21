var path = require('path');

var config = {

    root : path.join(__dirname, '..'),
    public : '/build/public',

    apiRoot : '/api',

    services : {
        soundcloud : {
            root : 'https://api.soundcloud.com',
            id : 'SOUNDCLOUD_API_KEY',
            secret : 'SOUNDCLOUD_API_SECRET',
            user : 'SOUNDCLOUD_API_USERNAME'
        }
    }
};

module.exports = config;
