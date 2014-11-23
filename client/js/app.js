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
    'mgcrea.ngStrap.modal',
    'ui.tree',
    'ngAnimate',
    'ngSanitize',
    'nvd3ChartDirectives'
]);

seoApp.config(['$modalProvider', '$routeProvider',
    function ($modalProvider, $routeProvider) {
        angular.extend($modalProvider.defaults, {
            html: true
        });
        $routeProvider
            .when('/', {
                templateUrl: 'partials/main.html',
                controller: 'MainCtrl'
            })
            .when('/sites', {
                templateUrl: 'partials/sites.html',
                controller: 'SitesCtrl'
            })
            .when('/captcha_test', {
                templateUrl: 'partials/captcha_test.html',
                controller: 'CaptchaTestCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);
