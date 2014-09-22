(function (app) {

    app.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {

        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');

        $stateProvider
            // feed
            .state('feed', {
                url : '/',
                templateUrl : 'feed/template.html',
                controller : 'FeedController'
            });
    });

})(app);
