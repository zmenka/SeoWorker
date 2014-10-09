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
                return $http.post('/api/sites', {"url": "ya.ru"});

            }
        };
    }]);

