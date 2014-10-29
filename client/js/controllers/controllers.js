'use strict';
/* Controllers */
var seoControllers = angular.module('seoControllers', []);

seoControllers.controller('SitesCtrl', ['$scope', '$window', 'SiteService', 'Params',
    function ($scope, $window, SiteService, Params) {

        $scope.formData = {url: 'facebook.com', keyWords: 'Добро пожаловать'};
        $scope.sites = SiteService.query();
        $scope.error = {msg: ""};


        // when submitting the add site, send the text to the node API
        $scope.createSite = function () {
            $scope.error.msg = "";
            //console.log($scope.formData);
            SiteService.save($scope.formData,
                function () {
                    $scope.formData = {};
                    $scope.error.msg = "";
                    console.log('site is saved');
                    $scope.sites = SiteService.query();
                },
                function (response) {
                    console.log('site is saved WITH ERROR!', response);
                });

        };

        $scope.getParams = function (site) {
            site.params = 'грузятся...';
            Params.calculation({ site_id: site._id , key_words: $scope.formData.keyWords})
                .then(function (res) {
//                var url = 'files/' + site.path;
//                console.log(url);
//                $window.open(url);
                    console.log("параметры получены");
                    site.params = '';
                    for (var key in res.data)
                    {
                        site.params += res.data[key].name + ': ' + res.data[key].val + '<br>';
                    }



                })
                .catch(function (err) {
                    console.log("параметры НЕ получены, ", err)
                    site.params = 'ошибка при получении';
                })

        }

    }]);




