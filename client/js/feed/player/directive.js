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
