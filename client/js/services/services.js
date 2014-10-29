'use strict';

/* Services */

var seoServices = angular.module('seoServices', ['ngResource']);

seoServices.factory('SiteService', ['$resource',
  function($resource){

      return $resource('/api/sites/:id');
  }]);

seoServices.factory('Params', ['$http',
    function($http){
        return {
            calculation: function(params) {
                return $http.post('/api/calculation', params);

            }
        };
    }]);

