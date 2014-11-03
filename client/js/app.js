'use strict';

/* App Module */

var seoApp = angular.module('seoApp', [
    'ngRoute',
    'ngResource',
    'seoControllers',
    'seoServices',
    'seoDirectives',
    'mgcrea.ngStrap.popover',
    'mgcrea.ngStrap.tooltip',
    'ui.tree'
    
]);

seoApp.config([ '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/main.html',
                controller: 'MainCtrl'
            })
            .when('/sites', {
                templateUrl: 'partials/sites.html',
                controller: 'SitesCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);
