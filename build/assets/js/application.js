(function (angular) {

    window.app = angular.module('Listen', [
        'templates',
        'ui.router',
        'ngResource',
        'ngAnimate',
        'ngTouch',
        'cfp.hotkeys'
    ]);

})(angular);

(function (app) {

    app.config(["$locationProvider", "$stateProvider", "$urlRouterProvider", function ($locationProvider, $stateProvider, $urlRouterProvider) {

        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');

        $stateProvider
            // feed
            .state('feed', {
                url : '/',
                templateUrl : 'feed/template.html',
                controller : 'FeedController'
            });
    }]);

})(app);

(function (app) {

    app.controller('FeedController', ["$scope", "$resource", function (
        $scope,
        $resource
    ) {

        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        $scope.isPlaying = false;
        $scope.currentSong = null;
        $scope.currentSongIndex = null;

        var SongList = $resource('/api/songs');
        songs = SongList.query({}, function () {
            $scope.songs = songs;
        });
    }]);

})(app);

(function (app) {

    app.directive('player', ['hotkeys', function (hotkeys) {
        return {
            templateUrl : 'feed/player/template.html',
            link : function (scope, element, attributes) {
                var audio = element.find('audio')[0];

                // create an analyzer
                var context = new AudioContext();
                var analyzer = context.createAnalyser();
                analyzer.fftSize = 2048;

                // connect the audio context to the audio tag
                context.createMediaElementSource(document.getElementsByTagName('audio')[0]).connect(analyzer);
                analyzer.connect(context.destination);

                // expose the analyzer to the scope
                scope.analyzer = analyzer;

                scope.$watch('currentSongIndex', function (index) {
                    if (typeof index !== 'number') return;

                    scope.currentSong = scope.songs[index];
                    scope.play();
                });

                element.find('audio').on('ended', function () {
                    if (scope.currentSongIndex + 1 < scope.songs.length) {
                        scope.next();
                        scope.$apply();
                    }
                });

                scope.previous = function () {

                    if (audio.currentTime >= 5 || scope.currentSongIndex === 0)
                        audio.currentTime = 0;
                    else if (scope.currentSongIndex > 0)
                        scope.currentSongIndex -= 1;
                };

                scope.next = function () {
                    if (scope.currentSongIndex + 1 < scope.songs.length)
                        scope.currentSongIndex += 1;
                };

                scope.play = function () {
                    audio.play();
                    scope.isPlaying = true;
                };

                scope.pause = function () {
                    audio.pause();
                    scope.isPlaying = false;
                };

                scope.togglePlayback = function () {
                    scope.isPlaying ? scope.pause() : scope.play();
                };

                hotkeys.bindTo(scope)
                    .add({
                        combo : 'space',
                        callback : function (event) {
                            event.preventDefault();
                            scope.togglePlayback();
                        }
                    })
                    .add({
                        combo : 'left',
                        callback : function (event) {
                            event.preventDefault();
                            scope.previous();
                        }
                    })
                    .add({
                        combo : 'right',
                        callback : function (event) {
                            event.preventDefault();
                            scope.next();
                        }
                    });

            }   
        };
    }]);

})(app);

angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("feed/about.html","<p>Made with &hearts; by <a href=\"http://jakelazaroff.com\"><strong>Jake Lazaroff</strong></a>.</p>\n");
$templateCache.put("feed/template.html","<section player class=\"player\" ng-hide=\"!currentSong\">\n</section>\n\n<ul song class=\"song-list\">\n</ul>\n\n<div class=\"about\" ng-include=\"\'feed/about.html\'\">\n</div>\n");
$templateCache.put("feed/player/template.html","<audio data-artist=\"{{ currentSong.user.username }}\" data-title=\"{{ currentSong.title }}\" ng-src=\"{{ currentSong.stream_url || \'\' }}\" autoplay></audio>\n<div class=\"controls\">\n    <button class=\"control\" ng-click=\"previous()\"><img src=\"/assets/img/rewind.svg\" alt=\"Previous\"></button>\n    <button class=\"control\" ng-click=\"togglePlayback()\"><img ng-src=\"/assets/img/{{ isPlaying ? \'pause\' : \'play\' }}.svg\" alt=\"{{ isPlaying ? \'Pause\' : \'Play\' }}\"></button>\n    <button class=\"control\" ng-click=\"next()\" ng-disabled=\"currentSongIndex + 1 === songs.length\"><img src=\"/assets/img/forward.svg\" alt=\"Next\"></button>\n</div>\n<div class=\"info\">\n    <img class=\"song-artwork\" ng-src=\" {{ currentSong.artwork_url || \'\' }}\" alt=\"{{ currentSong.title }}\" ng-hide=\"!currentSong\">\n    <span class=\"song-artist\">{{ currentSong.user.username }}</span>\n    <h1 class=\"song-title\">{{ currentSong.title }}</h1>\n</div>\n<a class=\"poweredby\" target=\"_blank\" href=\"{{ currentSong.user.permalink_url }}\"><img class=\"soundcloud\" src=\"/assets/img/soundcloud.svg\" alt=\"powered by SoundCloud\"></a>\n");
$templateCache.put("feed/song/template.html","<li class=\"song-poster js-song-poster js-{{ song.id }}\" ng-class=\"{playing: currentSong.id === song.id}\" ng-click=\"toggleSong(song)\" ng-model=\"song\" ng-repeat=\"song in songs\">\n    <img class=\"toggle\" ng-src=\"/assets/img/{{ isPlaying && currentSong.id === song.id ? \'pause\' : \'play\' }}.svg\" alt=\"{{ isPlaying && currentSong.id === song.id ? \'Pause\' : \'Play\' }}\">\n    <canvas class=\"spectrum js-spectrum\"></canvas>\n    <img class=\"song-artwork\" ng-src=\"{{ song.artwork_url || \'\' }}\" alt=\"{{ song.title }}\">\n</li>\n");}]);
(function (app) {

    app.directive('song', function () {
        return {
            templateUrl : 'feed/song/template.html',
            link : function (scope, element, attributes) {

                scope.toggleSong = function (song) {
                    var index = scope.songs.indexOf(song);

                    if (scope.currentSongIndex === index)
                        scope.togglePlayback();
                    else
                        scope.play();

                    scope.currentSongIndex = scope.songs.indexOf(song);
                };

                // get the divice's pixel ratio 
                var ratio = window.devicePixelRatio || 1;

                // when the song changes...
                scope.$watch('currentSong', function (song) {
                    // don't draw the spectrum if there's nothing playing
                    if (!song)
                        return;

                    // cache the song id, the poster element and the canvas element
                    var id = scope.currentSong.id;
                    var poster = document.getElementsByClassName('js-' + song.id)[0];
                    var spectrum = poster.getElementsByClassName('js-spectrum')[0];

                    // fetch the spectrum's drawing context
                    var canvas = spectrum.getContext('2d');

                    // draw the spectrum
                    var drawSpectrum = function () {

                        // find the size of the element
                        var size = spectrum.offsetWidth * ratio;

                        // if the current song is still playing, keep drawing the spectrum
                        if (id === scope.currentSong.id)
                            window.requestAnimationFrame(drawSpectrum);
                        // otherwise clear the canvas and stop drawing
                        else
                            return canvas.clearRect(0, 0, size, size);

                        // set the size of the canvas equal to the element's width
                        spectrum.width = spectrum.height = size;

                        canvas.clearRect(0, 0, size, size);
                        canvas.fillStyle = '#ffffff';

                        var radius = (poster.getElementsByClassName('toggle')[0].offsetWidth / 2) + 4;
                        var scaledAverage;
                        var bars = 100;
                        var increment = Math.PI * 2 / bars;
                        var data = new Uint8Array(100);
                        scope.analyzer.getByteFrequencyData(data);

                        canvas.save();
                        canvas.scale(ratio, ratio);
                        canvas.translate(poster.offsetWidth / 2, poster.offsetHeight / 2);
                        
                        var binSize = Math.floor(data.length / bars);

                        for (var i = 0; i < bars; i += 1) {
                            var sum = 0;
                            for (var j = 0; j < binSize; j += 1) {
                                sum += data[(i * binSize) + j];
                            }
                            scaledAverage = ((sum / binSize) / 256) * (radius);

                            canvas.fillRect(0, -radius, 1, -(scaledAverage > 1 ? scaledAverage : 1));
                            canvas.rotate(increment);
                        }


                        canvas.restore();
                    }

                    drawSpectrum(); 

                });

            }
        };
    });

})(app);
