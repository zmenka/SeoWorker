'use strict';

/* Services */

var seoServices = angular.module('seoServices', ['ngResource']);

seoServices.factory('SiteService', ['$resource',
    function ($resource) {

        return $resource('/api/sites/:id');
    }]);

seoServices.factory('Params', ['$http',
    function ($http) {
        return {
            calculation: function (site_id , key_words) {
                return $http.post('/api/calculation', {site_id:site_id,key_words:key_words });

            },
            parse: function (site_id , key_words) {
                return $http.post('/api/parse', {site_id:site_id,key_words:key_words });

            }
        };
    }]);
seoServices.factory('Captcha', ['$http',
    function ($http) {
        return {
            test: function (url, captcha, cookies) {
                return $http.post('/api/captcha', {url:url,captcha:captcha, cookies:cookies });

            }
        };
    }]);
seoServices.service('CaptchaModal', function($modal, $rootScope, $q) {
    var scope = $rootScope.$new();
    var deferred;
    scope.answer = function(res, captcha) {
        deferred.resolve({answer: res, captcha:captcha});
        confirm.hide();
    }

    var confirm = $modal({template: 'partials/captchaModal.html', scope: scope, show: false, title: 'Сервер получил капчу'});
    var parentShow = confirm.show;
    confirm.show = function(url) {
        confirm.$scope.content = url;
        confirm.$scope.captcha = "";
        deferred = $q.defer();
        parentShow();
        return deferred.promise;
    }

    return confirm;
})

