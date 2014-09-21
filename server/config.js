var path = require('path');

var config = {

    root : path.join(__dirname, '..'),
    public : '/build/public',

    apiRoot : '/api',

    services : {
        soundcloud : {
            root : 'https://api.soundcloud.com',
            id : process.env.SOUNDCLOUD_API_KEY,
            secret : process.env.SOUNDCLOUD_API_SECRET,
            user : process.env.SOUNDCLOUD_USER
        }
    }
};

module.exports = config;
