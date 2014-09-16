(function (angular) {

    // prefixing fix
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    var app = angular.module('Listen', ['templates', 'ngResource', 'ngAnimate', 'cfp.hotkeys']);

    app.controller('ListenController', ['$scope', '$resource', function ($scope, $resource) {

        $scope.isPlaying = false;
        $scope.currentSong = null;
        $scope.currentSongIndex = null;

        var SongList = $resource('/api/songs');
        songs = SongList.query({}, function () {
            $scope.songs = songs;
        });

    }]);

    app.directive('songList', function () {
        return {
            templateUrl : 'song.html',
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

                // create an analyzer
                var context = new AudioContext();
                var analyzer = context.createAnalyser();
                analyzer.fftSize = 2048;

                // connect the audio context to the audio tag
                context.createMediaElementSource(document.getElementsByTagName('audio')[0]).connect(analyzer);
                analyzer.connect(context.destination);

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
                        analyzer.getByteFrequencyData(data);

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

    app.directive('player', ['hotkeys', function (hotkeys) {
        return {
            templateUrl : 'player.html',
            link : function (scope, element, attributes) {
                var audio = element.find('audio')[0];

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

})(angular);
