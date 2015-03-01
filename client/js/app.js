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
    'mgcrea.ngStrap.alert',
    'mgcrea.ngStrap.aside',
//    'ui.bootstrap',
//    'ui.bootstrap.tpls',
//    'ui.bootstrap.accordion',
//    'ui.bootstrap.tooltip',
    'ui.tree',
    'ngAnimate',
    'ngSanitize',
    'nvd3'
]);

seoApp.config(['$modalProvider', '$routeProvider',
    function ($modalProvider, $routeProvider) {
        angular.extend($modalProvider.defaults, {
            html: true
        });
        $routeProvider
            .when('/sites', {
                templateUrl: 'partials/sites.html',
                authenticate: true
            })
            .when('/settings', {
                templateUrl: 'partials/settings.html',
                authenticate: true
            })
            .when('/login', {
                templateUrl: 'partials/login.html',
                authenticate: false
            })
            .when('/register', {
                templateUrl: 'partials/register.html',
                authenticate: true
            })
            .when('/logout', {
                redirectTo: '/login',
                authenticate: false
            })
            .when('/users', {
                templateUrl: 'partials/users.html',
                authenticate: true
            })
//            .when('/captcha_test', {
//                templateUrl: 'partials/captchatest.html',
//                controller: 'CaptchaTestCtrl'
//            })
            .otherwise({
                redirectTo: '/sites'
            });
    }]);

seoApp.run(['$rootScope', '$location', '$window', 'Authenticate',
    function ($rootScope, $location, $window, Authenticate) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            console.log(Authenticate.isAuthenticated)
            if (Authenticate.isAuthenticated == null ) {
                Authenticate.initAuth()
                    .then(function (result) {
                        if (typeof result.data === "boolean"){
                            Authenticate.isAuthenticated = result.data;
                        } else {
                            Authenticate.isAuthenticated = false;
                        }

                        console.log("Authenticate.isAuthenticated", Authenticate.isAuthenticated)


                    }).catch(function (err) {
                        Authenticate.isAuthenticated = false;
                        console.log("initAuth error ", err)
                    })
                    .then(function () {
                        console.log("$routeChangeStart init ", next.authenticate, Authenticate.isAuthenticated)
                        if ((typeof(next.authenticate) === "undefined" || next.authenticate) && Authenticate.isAuthenticated == false) {
                            console.log("redirect to login")
                            $location.path("/login");
                        }
                    })
            } else {
                console.log("$routeChangeStart", next.authenticate, Authenticate.isAuthenticated)
                if ((typeof(next.authenticate) === "undefined" || next.authenticate)
                    && !Authenticate.isAuthenticated) {
                    console.log("redirect to login")
                    $location.path("/login");
                }
            }
        })
    }]);