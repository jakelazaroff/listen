var path = require('path');

    var root = path.join(__dirname, '..');

var config = {

    root : root,
    client : path.join(root, '/build'),
    public : path.join(root, '/build/assets'),

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
