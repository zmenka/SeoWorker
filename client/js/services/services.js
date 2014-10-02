'use strict';

/* Services */

var seoServices = angular.module('seoServices', ['ngResource']);

seoServices.factory('Site', ['$resource',
  function($resource){
      return $resource('/api/sites/:id', { id: '@_id' }, {
          update: {
              method: 'PUT' // this method issues a PUT request
          }
      });
  }]);
