'use strict';

/* Services */

var seoServices = angular.module('seoServices', ['ngResource']);

seoServices.factory('Api', ['$http',
    function ($http) {
        return {
            users: function () {
                return $http.get('/api/users', {});
            },
            user: function (user_id) {
                return $http.get('/api/user', {
                    params: {user_id: user_id}
                })
            },
            edit_user: function (user_id, new_login, new_pasw, disabled, disabled_message) {
                return $http.post('/api/edit_user',
                    {user_id:user_id, new_login:new_login, new_pasw: new_pasw, disabled:disabled, disabled_message:disabled_message});
            },
            user_sites_and_tasks: function (user_id) {
                return $http.get('/api/user_sites_and_tasks', {
                    params : {user_id:user_id}
                });
            },
            sengines: function () {
                return $http.get('/api/sengines', {});
            },
            create_site: function (url, user_id) {
                return $http.post('/api/create_site', {url: url, user_id: user_id});
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
            calc_params: function ( url, condition_id, task_id) {
                return $http.post('/api/calc_params', {url: url, condition_id: condition_id,
                    task_id:task_id});
            },
            calc_site_params: function ( url, condition_id) {
                return $http.post('/api/calc_site_params', {url: url, condition_id: condition_id});
            },
            get_paramtypes: function (condition_id, url_id) {
                return $http.post('/api/get_paramtypes', { condition_id: condition_id, url_id: url_id});
            },
            get_params: function (url_id, condition_id, param_type) {
                return $http.post('/api/get_params', {url_id:url_id, condition_id: condition_id, param_type:param_type});
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
        var user = {login: null, id: null};

        function initDone() {
            return angular.isDefined(isAuthenticated);
        }

        function getIsAuthenticated() {
            return isAuthenticated;
        }

        function getIsAdmin() {
            return isAdmin;
        }

        function getUserLogin() {
            return user.login;
        }

        function getUserId() {
            return user.id;
        }

        function checkAuth () {
            return $http.get("/api/check_auth", {})
                .then(function (res ) {
                    if (res.data.isAuth){
                        isAuthenticated = true;
                        isAdmin = res.data.isAdmin
                    } else {
                        isAuthenticated = false;
                        isAdmin = false;
                    }
                    user.id =  res.data.userId;
                    user.login =  res.data.userLogin;
                    console.log('check_auth DONE', 'isAuthenticated ', isAuthenticated, ' isAdmin ', isAdmin)
                    return res;

                }).catch(function (err) {
                    console.log("check_auth service error ", err.data)
                    isAuthenticated = null;
                    isAdmin = false;
                    user = {login: null, id: null};
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
                .then(function () {
                    console.log('init auth isAuthenticated ', isAuthenticated, ' isAdmin ', getIsAdmin())
                    deferred.resolve(isAuthenticated);
                })
                .catch(function () {
                    deferred.reject(isAuthenticated);
                })

            return deferred.promise;
        };

        var checkAccess = function () {
            return initAuth()
                .then(function() {
                    console.log('checkAccess', $rootScope.toState, 'isAuthenticated ', isAuthenticated, ' isAdmin ', getIsAdmin())
                    if ($rootScope.toState.authenticate && !isAuthenticated) {
                        $rootScope.returnToState = $rootScope.toState;
                        $rootScope.returnToStateParams = $rootScope.toStateParams;

                        console.log("redirect to login");
                        $state.go('main.login');
                    } else if ($rootScope.toState.isAdmin && !getIsAdmin()) {
                        console.log("cant go to this page if not admin");
                        $state.go('main.accessdenied');
                    }
                })
                .catch(function() {
                    $state.go('main.error');
                })
        }

        var login = function (userData) {
            console.log('Authenticate login ')
            return $http.post("/api/login", userData)
                .then(function () {
                    return checkAuth();
                }).catch(function (err) {
                    console.log("login service error ", err.data)
                    isAuthenticated = null;
                    isAdmin = false;
                    user = {login: null, id: null};
                    throw err;
                });
        };



        var logout = function () {
            return $http.get("/api/logout")
                .then(function (res) {
                    isAuthenticated = false;
                    isAdmin = false;
                    user = {login: null, id: null};
                    return res
                }).catch(function (err) {
                    console.log("logout service error ", err.data)

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
            userLogin: getUserLogin,
            userId: getUserId,
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

