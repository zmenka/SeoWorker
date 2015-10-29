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
    'ui.bootstrap.tpls',
    'ui.bootstrap.accordion',
//    'ui.bootstrap.tooltip',
    'ui.tree',
    'ngAnimate',
    'ngSanitize',
    'nvd3',
    'ui.select',
    'ui.grid'
]);

seoApp.config(["$stateProvider", "$urlRouterProvider",
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/index");
        //
        // Now set up the states
        $stateProvider
            .state('main', {
                url: "",
                template: "<div ui-view>qweqwe</div>",
                abstract: true,
                authenticate: true,
                resolve: {
                    Authenticate: ['Authenticate',
                        function(Authenticate) {
                            console.log('RESOLVE checkAccess')
                            return Authenticate.checkAccess();
                        }
                    ]
                }
            })
            .state('main.hello', {
                url: "/",
                templateUrl: "partials/main.html",
                authenticate: true
            })
            .state('main.promotion', {
                url: "/promotion/:user_id",
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
                url: "/settings/:user_id",
                templateUrl: 'partials/settings.html',
                authenticate: true
            })
            .state('main.login', {
                url: '/login',
                templateUrl: 'partials/login.html',
                authenticate: false
            })
            .state('main.logout', {
                url: '/logout',
                redirectTo: '/login',
                authenticate: false
            })
            .state('main.users', {
                url: '/users',
                templateUrl: 'partials/users.html',
                authenticate: true
            })
            .state('main.manage', {
                url: '/manage',
                templateUrl: 'partials/manage.html',
                authenticate: true,
                isAdmin: true
            })
            .state('main.edit_user', {
                url: '/user/:user_id',
                templateUrl: 'partials/edit_user.html',
                authenticate: true,
                isAdmin: true
            })
            .state('main.accessdenied', {
                url: '/accessdenied',
                templateUrl: 'partials/accessdenied.html'
            })
            .state('main.error', {
                url: '/error',
                templateUrl: 'partials/error.html'
            })
            .state('main.rating', {
                url: '/rating/:user_id',
                templateUrl: 'partials/rating.html',
                authenticate: true
            })
//            .state('main.captcha_test', {
//                templateUrl: 'partials/captchatest.html',
//                authenticate: false
//            })

    }]);

seoApp.run(['$rootScope', '$state',  'Authenticate',
    function ($rootScope, $state, Authenticate) {
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                $rootScope.toState = toState;
                $rootScope.toStateParams = toParams;
                console.log('$stateChangeStart go? ', Authenticate.initDone())
                if (Authenticate.initDone()) {
                    Authenticate.checkAccess();
                }

            }
        );
    }]);