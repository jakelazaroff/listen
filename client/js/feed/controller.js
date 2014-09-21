(function (app) {

    app.controller('FeedController', function (
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
    });

})(app);
