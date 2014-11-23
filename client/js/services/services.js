'use strict';

/* Services */

var seoServices = angular.module('seoServices', ['ngResource']);

seoServices.factory('Api', ['$http',
    function ($http) {
        return {
            user_sites_and_tasks: function () {
                return $http.get('/api/user_sites_and_tasks', {});
            },
            create_site: function (url) {
                return $http.post('/api/create_site', {url: url});
            },
            create_task: function (usurl_id, condition_query) {
                return $http.post('/api/create_task', {usurl_id: usurl_id, condition_query: condition_query});
            },
            calc_params: function (condition_id, captcha) {
                return $http.post('/api/calc_params', {condition_id: condition_id, captcha: captcha});
            },
            get_params: function (condition_id) {
                return $http.post('/api/get_params',{condition_id: condition_id});
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

    var confirm = $modal({template: 'partials/captchaModal.html', scope: scope, show: false, title: 'Сервер получил капчу'});
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

