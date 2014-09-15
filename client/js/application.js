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

                scope.$watch('currentSong', function (song) {
                    if (!song)
                        return;

                    var id = scope.currentSong.id;
                    var poster = document.getElementsByClassName('js-' + song.id)[0];

                    var spectrum = poster.getElementsByClassName('js-spectrum')[0];
                    var canvas = spectrum.getContext('2d');

                    var context = new AudioContext();
                    var analyser = context.createAnalyser();
                    analyser.fftSize = 2048;

                    var source = context.createMediaElementSource(document.getElementsByTagName('audio')[0]);
                    source.connect(analyser);
                    analyser.connect(context.destination);

                    var drawSpectrum = function () {
                        if (id === scope.currentSong.id)
                            window.requestAnimationFrame(drawSpectrum);
                        else
                            return canvas.clearRect(0, 0, poster.offsetWidth, poster.offsetHeight);

                        var size = spectrum.width = spectrum.height = poster.offsetWidth;
                        canvas.fillStyle = '#ffffff';

                        var radius = (poster.getElementsByClassName('toggle')[0].offsetWidth / -2) + 2;
                        var average;
                        var bar_width = 2;
                        var scaled_average;
                        var num_bars = 60;
                        var increment = Math.PI * 2 / num_bars;
                        var data = new Uint8Array(512);
                        analyser.getByteFrequencyData(data);

                        canvas.save();
                        canvas.translate(size / 2, size / 2);
                        
                        var bin_size = Math.floor(data.length / num_bars);
                        for (var i = 0; i < num_bars; i += 1) {
                            var sum = 0;
                            for (var j = 0; j < bin_size; j += 1) {
                                sum += data[(i * bin_size) + j];
                            }
                            average = sum / bin_size;
                            scaled_average = (average / 256) * (size / 10);

                            canvas.fillRect(0, radius, bar_width, -scaled_average);
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
