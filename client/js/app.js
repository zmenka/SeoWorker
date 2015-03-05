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
                authenticate: true
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
            .when('main.captcha_test', {
                templateUrl: 'partials/captchatest.html',
                authenticate: false
            })

    }]);

seoApp.run(['$rootScope', '$state',  'Authenticate',
    function ($rootScope, $state, Authenticate) {
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams){
//                console.log('isAuthenticated', Authenticate.isAuthenticated)

            if (Authenticate.isAuthenticated == null ) {
                Authenticate.initAuth()
                    .then(function (result) {
                        if (typeof result.data === "boolean"){
                            Authenticate.isAuthenticated = result.data;
                        } else {
                            Authenticate.isAuthenticated = false;
                        }

                        console.log("Authenticate.initAuth ", Authenticate.isAuthenticated)


                    }).catch(function (err) {
                        Authenticate.isAuthenticated = false;
                        console.log("Authenticate.initAuth error ", err)
                    })
                    .then(function () {
                        console.log("stateChangeStart init ", toState.authenticate, Authenticate.isAuthenticated)
                        if ((typeof(toState.authenticate) === "undefined" || toState.authenticate) && Authenticate.isAuthenticated == false) {
                            console.log("redirect to login");
                            $state.go('main.login');
                        }
                    })
            } else {
                console.log("stateChangeStart", toState, Authenticate.isAuthenticated)
                if (toState.url == 'login'){
                    return;
                }
                if (toState.authenticate   && !Authenticate.isAuthenticated) {
                    console.log("redirect to login");

                    $state.go('main.login');
                    console.log($state);
                }
            }
        })
    }]);