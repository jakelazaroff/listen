var express = require('express');
var path = require('path');
var request = require('request');

var config = require('./config');
var services = require('./services');

var app = express();

if (process.env.NODE_ENV === 'development') 
    app.use(require('connect-livereload')());

// static assets
app.use('/assets', express.static(config.public));

// songs API endpoint
app.get(config.apiRoot + '/songs', function (req, res) {
    request({
        url : services.soundcloud.endpoint('/users/' + config.services.soundcloud.user + '/favorites', 'json'),
        json : true
    }, function (error, response, songs) {
        songs.forEach(function (song) {
            song.title = services.soundcloud.normalizeTitle(song.title, song.user.username);
            song.artwork_url = services.soundcloud.imageSize(song.artwork_url, 't500x500');
            song.stream_url = config.apiRoot + '/songs/' + song.id + '/stream';
        });
        res.setHeader('Content-Type', 'application/json');
        res.send(songs);
    });
});

// song stream API endpoint
app.get(config.apiRoot + '/songs/:id/stream', function (req, res) {
    req.pipe(request(services.soundcloud.endpoint('/tracks/' + req.params.id + '/stream'))).pipe(res);
});

// single-page app
app.get('*', function (req, res) {
    res.sendfile(path.join(config.client, 'index.html'));
});

app.listen(process.env.PORT || 3000);
