'use strict';

/* Services */

var seoServices = angular.module('seoServices', ['ngResource']);

seoServices.factory('SiteService', ['$resource',
  function($resource){

      return $resource('/api/sites/:id');
  }]);

seoServices.factory('Test', ['$http',
    function($http){
        return {
            createSite: function(site) {
                return $http.post('/api/sites', {"url": "ya.ru"});

            }
        };
    }]);

