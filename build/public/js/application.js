!function(n){window.app=n.module("Listen",["templates","ngRoute","ngResource","ngAnimate","ngTouch","cfp.hotkeys"])}(angular),function(n){n.config(["$locationProvider","$routeProvider",function(n,e){n.html5Mode(!0),e.when("/",{templateUrl:"feed/template.html",controller:"FeedController"}).otherwise({redirectTo:"/"})}])}(app),function(n){n.controller("FeedController",["$scope","$resource",function(n,e){window.AudioContext=window.AudioContext||window.webkitAudioContext,n.isPlaying=!1,n.currentSong=null,n.currentSongIndex=null;var t=e("/api/songs");songs=t.query({},function(){n.songs=songs})}])}(app),function(n){n.directive("player",["hotkeys",function(n){return{templateUrl:"feed/player/template.html",link:function(e,t){var o=t.find("audio")[0],a=new AudioContext,r=a.createAnalyser();r.fftSize=2048,a.createMediaElementSource(document.getElementsByTagName("audio")[0]).connect(r),r.connect(a.destination),e.analyzer=r,e.$watch("currentSongIndex",function(n){"number"==typeof n&&(e.currentSong=e.songs[n],e.play())}),t.find("audio").on("ended",function(){e.currentSongIndex+1<e.songs.length&&(e.next(),e.$apply())}),e.previous=function(){o.currentTime>=5||0===e.currentSongIndex?o.currentTime=0:e.currentSongIndex>0&&(e.currentSongIndex-=1)},e.next=function(){e.currentSongIndex+1<e.songs.length&&(e.currentSongIndex+=1)},e.play=function(){o.play(),e.isPlaying=!0},e.pause=function(){o.pause(),e.isPlaying=!1},e.togglePlayback=function(){e.isPlaying?e.pause():e.play()},n.bindTo(e).add({combo:"space",callback:function(n){n.preventDefault(),e.togglePlayback()}}).add({combo:"left",callback:function(n){n.preventDefault(),e.previous()}}).add({combo:"right",callback:function(n){n.preventDefault(),e.next()}})}}}])}(app),angular.module("templates",[]).run(["$templateCache",function(n){n.put("feed/about.html",'<p>Made with &hearts; by <a href="http://jakelazaroff.com"><strong>Jake Lazaroff</strong></a>.</p>\n'),n.put("feed/template.html",'<section player class="player" ng-hide="!currentSong">\n</section>\n\n<ul song class="song-list">\n</ul>\n\n<div class="about" ng-include="\'feed/about.html\'">\n</div>\n'),n.put("feed/song/template.html",'<li class="song-poster js-song-poster js-{{ song.id }}" ng-class="{playing: currentSong.id === song.id}" ng-click="toggleSong(song)" ng-model="song" ng-repeat="song in songs">\n    <img class="toggle" ng-src="/img/{{ isPlaying && currentSong.id === song.id ? \'pause\' : \'play\' }}.svg" alt="{{ isPlaying && currentSong.id === song.id ? \'Pause\' : \'Play\' }}">\n    <canvas class="spectrum js-spectrum"></canvas>\n    <img class="song-artwork" ng-src="{{ song.artwork_url || \'\' }}" alt="{{ song.title }}">\n</li>\n'),n.put("feed/player/template.html",'<audio data-artist="{{ currentSong.user.username }}" data-title="{{ currentSong.title }}" ng-src="{{ currentSong.stream_url || \'\' }}" autoplay></audio>\n<div class="controls">\n    <button class="control" ng-click="previous()"><img src="/img/rewind.svg" alt="Previous"></button>\n    <button class="control" ng-click="togglePlayback()"><img ng-src="/img/{{ isPlaying ? \'pause\' : \'play\' }}.svg" alt="{{ isPlaying ? \'Pause\' : \'Play\' }}"></button>\n    <button class="control" ng-click="next()" ng-disabled="currentSongIndex + 1 === songs.length"><img src="/img/forward.svg" alt="Next"></button>\n</div>\n<div class="info">\n    <img class="song-artwork" ng-src=" {{ currentSong.artwork_url || \'\' }}" alt="{{ currentSong.title }}" ng-hide="!currentSong">\n    <span class="song-artist">{{ currentSong.user.username }}</span>\n    <h1 class="song-title">{{ currentSong.title }}</h1>\n</div>\n<a class="poweredby" target="_blank" href="{{ currentSong.user.permalink_url }}"><img class="soundcloud" src="/img/soundcloud.svg" alt="powered by SoundCloud"></a>\n')}]),function(n){n.directive("song",function(){return{templateUrl:"feed/song/template.html",link:function(n){n.toggleSong=function(e){var t=n.songs.indexOf(e);n.currentSongIndex===t?n.togglePlayback():n.play(),n.currentSongIndex=n.songs.indexOf(e)};var e=window.devicePixelRatio||1;n.$watch("currentSong",function(t){if(t){var o=n.currentSong.id,a=document.getElementsByClassName("js-"+t.id)[0],r=a.getElementsByClassName("js-spectrum")[0],l=r.getContext("2d"),s=function(){var t=r.offsetWidth*e;if(o!==n.currentSong.id)return l.clearRect(0,0,t,t);window.requestAnimationFrame(s),r.width=r.height=t,l.clearRect(0,0,t,t),l.fillStyle="#ffffff";var i,c=a.getElementsByClassName("toggle")[0].offsetWidth/2+4,g=100,u=2*Math.PI/g,d=new Uint8Array(100);n.analyzer.getByteFrequencyData(d),l.save(),l.scale(e,e),l.translate(a.offsetWidth/2,a.offsetHeight/2);for(var f=Math.floor(d.length/g),p=0;g>p;p+=1){for(var m=0,y=0;f>y;y+=1)m+=d[p*f+y];i=m/f/256*c,l.fillRect(0,-c,1,-(i>1?i:1)),l.rotate(u)}l.restore()};s()}})}}})}(app);