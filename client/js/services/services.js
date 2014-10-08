'use strict';

/* Services */

var seoServices = angular.module('seoServices', ['ngResource']);

seoServices.factory('Site', ['$resource',
  function($resource){
      return $resource('/api/sites/:_id');
  }]);

seoServices.factory('Test', ['$http',
    function($http){
        return {
            createSite: function(site) {
                return $http({
                    url: '/api/sites',
                    method: "POST",
                    data: {"url": "ya.ru"},
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
            }
        };
    }]);

