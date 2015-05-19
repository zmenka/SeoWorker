function MainCtrl($scope, Authenticate) {
    var vm = this;
    vm.isSignedIn = function () {
        return Authenticate.isAuthenticated;
    };

    vm.checkAdmin  = function () {
        Authenticate.checkAdmin()
            .success(function (data, status, header) {
                console.log("check_admin11 service", data)
            }).error(function (data) {
                console.log("check_admin11 service error ", data)

            });;
    }

}
angular.module('seoControllers').controller('MainCtrl', MainCtrl);