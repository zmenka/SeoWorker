'use strict';

/* App Module */

var seoApp = angular.module('seoApp', [
    'ngRoute',
    'ngResource',
    'seoControllers',
    'seoServices',
    'seoDirectives',
    'mgcrea.ngStrap'

]);

seoApp.config([ '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/sites', {
                templateUrl: 'partials/sites.html',
                controller: 'SitesCtrl'
            })
            .otherwise({
                redirectTo: '/sites'
            });
    }]);
