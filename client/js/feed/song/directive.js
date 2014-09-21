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
