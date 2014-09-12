(function () {

    var app = angular.module('Listen', ['ngResource', 'ngAnimate']);

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
            templateUrl : 'templates/song.html',
            link : function (scope, element, attributes) {

                scope.toggleSong = function (song) {
                    var index = scope.songs.indexOf(song);

                    if (scope.currentSongIndex === index)
                        scope.togglePlayback();
                    else
                        scope.play();

                    scope.currentSongIndex = scope.songs.indexOf(song);
                };
            }
        };
    });

    app.directive('player', function () {
        return {
            templateUrl : 'templates/player.html',
            link : function (scope, element, attributes) {
                var audio = element.find('audio')[0];

                scope.$watch('currentSongIndex', function (index) {
                    console.log
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

                    if (audio.currentTime >= 5)
                        audio.currentTime = 0;
                    else
                        scope.currentSongIndex -= 1;
                };

                scope.next = function () {
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
            }   
        };
    });

})();
