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
            calc_params: function ( url, condition_id, captcha) {
                return $http.post('/api/calc_params', {url: url, condition_id: condition_id, captcha: captcha});
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

var SitesAside = (function () {
    function SitesAside($aside, $rootScope, $q) {
        this.$aside = $aside;
        this.$rootScope = $rootScope;
        this.$q = $q;
        this.mySideScope = null;
        this.HideMySide = null;
        this.myAside = null;
    }

    var siteSelect = function (scope) {
        console.log("select", scope);
    };

    SitesAside.prototype.show = function (template, params, select) {
        if (!template) { template = 'partials/sites_aside_template.html'; }
        if (!params) { params = null; }
        if (!select) {
            select = siteSelect;
        }
        this.mySideScope = this.$rootScope.$new();
        this.mySideScope.params = params;
        this.mySideScope.isHide = {value: false};
        this.mySideScope.checkHide = function (scope) {
            console.log(scope);
            if(scope.isHide.value){
                scope.$hide();
            }

        };


        this.mySideScope.siteToggle = function (scope) {
            console.log("toggle", scope);
            scope.toggle();
        };

        this.mySideScope.siteSelect = select;

        this.myAside = this.$aside({scope: this.mySideScope,show:true,
            placement: "left", animation: "am-slide-left",
             template: template});

    };

    SitesAside.prototype.setHide = function () {
        console.log("HIDE!", this.myAside);
        if (this.myAside ){
            this.myAside.hide();
            this.myAside = null;
        }

    };

    return SitesAside;
})();

seoServices.service("SitesAside", function ($modal, $rootScope, $q) {
    return new SitesAside($modal, $rootScope, $q);
});

seoServices.factory('Authenticate', ['$http',
    function ($http) {

        var isAuthenticated = null;

        var initAuth = function () {
            return $http.get("/api/check_auth")

        };


        var login = function (userData) {
            console.log('Authenticate login ', userData)
            var promise = $http.post("/api/login", userData);
            return promise;
        };

        var logout = function () {
            return $http.get("/api/logout");
        };


        var register = function (userData) {
            console.log('Authenticate register ', userData)
            var promise = $http.post("/api/register", userData);
            return promise;

        }

        return {
            login: login,
            logout: logout,
            isAuthenticated: isAuthenticated,
            initAuth: initAuth,
            register: register
        }
    }]);

