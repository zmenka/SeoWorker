'use strict';

/* Services */

var seoServices = angular.module('seoServices', ['ngResource']);

seoServices.factory('Api', ['$http',
    function ($http) {
        return {
            users: function () {
                return $http.get('/api/users', {});
            },
            user_sites_and_tasks: function () {
                return $http.get('/api/user_sites_and_tasks', {});
            },
            sengines: function () {
                return $http.get('/api/sengines', {});
            },
            create_site: function (url) {
                return $http.post('/api/create_site', {url: url});
            },
            create_task: function (usurl_id, condition_query, sengine_id, region, size_search) {
                return $http.post('/api/create_task', {usurl_id: usurl_id,
                    condition_query: condition_query, sengine_id:sengine_id,
                    region: region, size_search: size_search});
            },
//            save_task: function (task_id, condition_query, sengine_id, region, size_search) {
//                return $http.post('/api/save_task', {task_id: task_id,
//                    condition_query: condition_query, sengine_id:sengine_id,
//                    region: region, size_search: size_search});
//            },
//            calc_params: function ( url, condition_id) {
//                return $http.post('/api/calc_params', {url: url, condition_id: condition_id});
//            },
            calc_site_params: function ( url, condition_id) {
                return $http.post('/api/calc_site_params', {url: url, condition_id: condition_id});
            },
            get_params: function (url_id, condition_id) {
                return $http.post('/api/get_params', {url_id: url_id, condition_id: condition_id});
            }
        };
    }]);

seoServices.factory('Captcha', ['$http',
    function ($http) {
        return {
            test: function (url, captcha, cookies) {
                return $http.post('/api/captcha', {url: url, captcha: captcha, cookies: cookies });

            }
        };
    }]);
seoServices.service('CaptchaModal', function ($modal, $rootScope, $q) {
    var scope = $rootScope.$new();
    var deferred;
    scope.answer = function (res, captcha) {
        deferred.resolve({answer: res, captcha: captcha});
        confirm.hide();
    }

    var confirm = $modal({template: 'partials/captchamodal.html', scope: scope, show: false, title: 'Сервер получил капчу'});
    var parentShow = confirm.show;
    confirm.show = function (url) {
        confirm.$scope.content = url;
        confirm.$scope.captcha = "";
        deferred = $q.defer();
        parentShow();
        return deferred.promise;
    }

    return confirm;
})

seoServices.factory('Authenticate', ['$rootScope', '$http', '$state', '$q',
    function ($rootScope, $http, $state, $q) {

        var isAuthenticated = undefined;
        var isAdmin = false;

        function initDone() {
            return angular.isDefined(isAuthenticated);
        }

        function getIsAuthenticated() {
            return isAuthenticated;
        }

        function getIsAdmin() {
            return isAdmin;
        }

        function checkAuth () {
            return $http.get("/api/check_auth")
                .success(function (data, status, header) {
                    if (data.isAuth){
                        isAuthenticated = true;
                        if (data.isAdmin){
                            isAdmin = true;
                        }
                    } else {
                        isAuthenticated = false;
                        isAdmin = false;
                    }
                    return data;

                }).error(function (err) {
                    console.log("check_auth service error ", err)
                    isAuthenticated = null;
                    isAdmin = false;
                    throw err;
                });
        }

        var initAuth = function () {
            var deferred = $q.defer();
            if (angular.isDefined(isAuthenticated)) {
                console.log('initAuth not need')
                deferred.resolve(isAuthenticated);
                return deferred.promise;
            }

            checkAuth()
                .then(function (data) {
                    console.log('init auth isAuthenticated ', isAuthenticated, ' isAdmin ', isAdmin)
                    deferred.resolve(isAuthenticated);
                })
                .catch(function (err) {
                    deferred.reject(isAuthenticated);
                })

            return deferred.promise;
        };

        var checkAccess = function () {
            return initAuth()
                .then(function() {
                    console.log('checkAccess', $rootScope.toState)
                    if ($rootScope.toState.authenticate && !isAuthenticated) {
                        $rootScope.returnToState = $rootScope.toState;
                        $rootScope.returnToStateParams = $rootScope.toStateParams;

                        console.log("redirect to login");
                        $state.go('main.login');
                    } else if ($rootScope.toState.isAdmin && !isAdmin) {
                        console.log("cant go to this page if not admin");
                        $state.go('main.accessdenied');
                    }
                })
                .catch(function() {
                    $state.go('main.error');
                })
        }

        var login = function (userData) {
            console.log('Authenticate login ', userData)
            return $http.post("/api/login", userData)
                .success(function (data, status, header) {
                    return checkAuth();
                }).error(function (err) {
                    console.log("login service error ", err)
                    isAuthenticated = null;
                    isAdmin = false;
                    throw err;
                });
        };

        var logout = function () {
            return $http.get("/api/logout")
                .success(function (data, status, header) {
                    isAuthenticated = false;
                    isAdmin = false;
                    return data
                }).error(function (err) {
                    console.log("logout service error ", err)

                    throw err;
                });
        };

        var register = function (userData) {
            console.log('Authenticate register ', userData)
            var promise = $http.post("/api/register", userData);
            return promise;

        }

        return {
            login: login,
            logout: logout,
            register: register,

            isAuthenticated: getIsAuthenticated,
            isAdmin: getIsAdmin,
            checkAccess: checkAccess,
            initDone: initDone
        }
    }]);

var SitesAside = (function () {
    function SitesAside($aside) {
        this.$aside = $aside;

        this.myAside = null;
    }

    SitesAside.prototype.show = function (scope, sites, selectMethod) {
        console.log("SitesAside.prototype.show",  sites, selectMethod);
        if(!this.myAside ){
            console.log('CREATE NEW ASIDE');
            scope.sites = sites;
            scope.nodeselect = selectMethod;

            this.myAside = this.$aside({show: true, scope: scope,
                placement: "left", animation: "fade-and-slide-left",
                template: 'partials/sites_aside_template.html'});
        } else {
            console.log("OLD ASIDE");
            this.myAside.show()
        }

    };

    return SitesAside;
})();

seoServices.service("SitesAside", function ($modal, $rootScope, $q) {
    return new SitesAside($modal, $rootScope, $q);
});

