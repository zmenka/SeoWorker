'use strict';

/* Controllers */

var seoControllers = angular.module('seoControllers', []);


seoControllers.controller('SitesCtrl', ['$scope', 'Site',
    function ($scope, Site) {

        $scope.formData = {};
        $scope.sites = Site.query();
        $scope.error = {msg: ""};


        // when submitting the add site, send the text to the node API
        $scope.createSite = function () {
            $scope.error.msg = "";
            console.log($scope.formData);
            new Site($scope.formData).$save(
                function() {
                    $scope.formData = {};
                    $scope.error.msg = "";
                    console.log('site is saved');
                    $scope.sites = Site.query();
                    });

        };

        $scope.click = function (site) {
            var url = 'client/files/' + site.path;
            console.log(url);
            $window.open(url);
        }

    }]);


