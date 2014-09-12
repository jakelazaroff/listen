var config = require('./config');

var soundcloud = {

    endpoint : function (path, format) {
        format = format ? '.' + format : '';
        return config.services.soundcloud.root + path + format + '?client_id=' + config.services.soundcloud.id;
    },

    imageSize : function (url, size) {
        return url.replace(/(t500x500|crop|t300x300|large|t67x67|badge|small|tiny|mini|original)/, size);
    },

    normalizeTitle : function (title, artist) {
        return title.replace(
            new RegExp('^' + artist.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + '.*- '), ''
        );

    }

}

module.exports.soundcloud = soundcloud;
