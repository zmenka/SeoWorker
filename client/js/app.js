'use strict';

/* App Module */

var seoApp = angular.module('seoApp', [
    'ui.router',
    'ngResource',
    'seoControllers',
    'seoServices',
    'seoDirectives',
    'mgcrea.ngStrap.popover',
    'mgcrea.ngStrap.tooltip',
    'mgcrea.ngStrap.modal',
    'mgcrea.ngStrap.alert',
    'mgcrea.ngStrap.aside',
    'mgcrea.ngStrap.dropdown',
//    'ui.bootstrap',
//    'ui.bootstrap.tpls',
//    'ui.bootstrap.accordion',
//    'ui.bootstrap.tooltip',
    'ui.tree',
    'ngAnimate',
    'ngSanitize',
    'nvd3'
]);

seoApp.config(["$stateProvider", "$urlRouterProvider",
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/promotion/chart");
        //
        // Now set up the states
        $stateProvider
            .state('main', {
                url: "/",
                template: "<div ui-view></div>",
                abstract: true,
                authenticate: true
            })
            .state('main.promotion', {
                url: "promotion",
                templateUrl: "partials/sites.html",
                authenticate: true
            })
            .state('main.promotion.chart', {
                url: "/chart",
                templateUrl: "partials/chart.html",
                authenticate: true
            })
            .state('main.promotion.selection', {
                url: "/selection",
                templateUrl: 'partials/selection.html',
                authenticate: true
            })
            .state('main.settings', {
                url: "settings",
                templateUrl: 'partials/settings.html',
                authenticate: true
            })
            .state('main.login', {
                url: 'login',
                templateUrl: 'partials/login.html',
                authenticate: false
            })
            .state('main.register', {
                url: 'register',
                templateUrl: 'partials/register.html',
                authenticate: true
            })
            .state('main.logout', {
                url: 'logout',
                redirectTo: '/login',
                authenticate: false
            })
            .state('users', {
                url: 'users',
                templateUrl: 'partials/users.html',
                authenticate: true
            })
//            .when('main.captcha_test', {
//                templateUrl: 'partials/captchatest.html',
//                controller: 'CaptchaTestCtrl'
//            })

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