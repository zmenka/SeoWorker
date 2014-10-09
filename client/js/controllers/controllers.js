'use strict';

/* Controllers */

var seoControllers = angular.module('seoControllers', []);


seoControllers.controller('SitesCtrl', ['$scope', '$window', 'Site', 'Test',
    function ($scope, $window,  Site) {

        $scope.formData = {};
        $scope.sites = Site.query();
        $scope.error = {msg: ""};


        // when submitting the add site, send the text to the node API
        $scope.createSite = function () {
            $scope.error.msg = "";
            console.log($scope.formData);
            Site.save($scope.formData,
                function() {
                    $scope.formData = {};
                    $scope.error.msg = "";
                    console.log('site is saved');
                    $scope.sites = Site.query();
                },
                function(response) {
                    console.log('site is saved WITH ERROR!', response);
                });

        };

        $scope.click = function (site) {
            var url = 'files/' + site.path;
            console.log(url);
            $window.open(url);
        }

    }]);


