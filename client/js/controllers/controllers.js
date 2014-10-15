'use strict';

/* Controllers */

var seoControllers = angular.module('seoControllers', []);


seoControllers.controller('SitesCtrl', ['$scope', '$window', 'SiteService',
    function ($scope, $window,  SiteService) {

        $scope.formData = {url: 'facebook.com'};
        $scope.sites = SiteService.query();
        $scope.error = {msg: ""};


        // when submitting the add site, send the text to the node API
        $scope.createSite = function () {
            $scope.error.msg = "";
            //console.log($scope.formData);
            SiteService.save($scope.formData,
                function() {
                    $scope.formData = {};
                    $scope.error.msg = "";
                    console.log('site is saved');
                    $scope.sites = SiteService.query();
                },
                function(response) {
                    console.log('site is saved WITH ERROR!', response);
                });

        };

        $scope.click = function (site) {
            var site = SiteService.get({ id: site._id }, function() {
                
            });
//            var url = 'files/' + site.path;
//            console.log(url);
//            $window.open(url);
        }

    }]);


