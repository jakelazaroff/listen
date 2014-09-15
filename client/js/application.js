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

                // scope.$watch('currentSong', function (song) {
                //     if (!song)
                //         return;

                //     var poster = document.getElementsByClassName('js-' + song.id)[0];

                //     var canvas = poster.getElementsByClassName('js-spectrum')[0].getContext('2d');

                //     var context = new webkitAudioContext();
                //     var analyser = context.createAnalyser();
                //     analyser.fftSize = 2048;

                //     var source = context.createMediaElementSource(document.getElementsByTagName('audio')[0]);
                //     source.connect(analyser);
                //     analyser.connect(context.destination);
                //     freqAnalyser();

                //     function freqAnalyser() {
                //         window.requestAnimationFrame(freqAnalyser);
                //         var average;
                //         var bar_width;
                //         var scaled_average;
                //         var num_bars = 30;
                //         var data = new Uint8Array(2048);
                //         analyser.getByteFrequencyData(data);

                //         // clear canvas
                //         canvas.clearRect(0, 0, poster.offsetWidth, poster.offsetHeight);
                //         var bin_size = Math.floor(data.length / num_bars);
                //         for (var i = 0; i < num_bars; i += 1) {
                //             var sum = 0;
                //             for (var j = 0; j < bin_size; j += 1) {
                //                 sum += data[(i * bin_size) + j];
                //             }
                //             average = sum / bin_size;
                //             bar_width = poster.offsetWidth / num_bars;
                //             scaled_average = (average / 256) * poster.offsetHeight;
                //             canvas.fillRect(i * bar_width, poster.offsetHeight, bar_width - 2, - scaled_average);
                //         }
                //     }

                // });

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
