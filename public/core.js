/**
 * Created by zmenka on 19.09.14.
 */
var seoApp = angular.module('seoApp', []);

function mainController($scope, $http, $window) {
    $scope.formData = {};
    $scope.sites = [];
    $scope.error = {msg: ""};
    // when landing on the page, get all sites and show them
    $http.get('/api/sites')
        .success(function(data) {
            $scope.sites = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
            $scope.sites = [];
        });

    // when submitting the add site, send the text to the node API
    $scope.createSite = function() {
        $scope.error.msg = "";
        $http.post('/api/site', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.sites = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ',  data);
                $scope.error.msg = "Ошибка: " + data.code + ". Попробуйте ввести другой адрес.";
            });
    };

    $scope.click = function(site) {
        var url = 'files/'+ site.path;
        console.log(url);
        $window.open(url);
    }

}