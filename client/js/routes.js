(function (app) {

    app.config(function ($locationProvider, $routeProvider) {

        $locationProvider.html5Mode(true);

        $routeProvider

            // library
            .when('/', {
                templateUrl : 'feed/template.html',
                controller : 'FeedController'
            })
            .otherwise({
                redirectTo : '/' 
            });
    });

})(app);
