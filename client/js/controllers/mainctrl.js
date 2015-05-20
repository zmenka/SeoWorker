function MainCtrl($scope, $state,  Authenticate) {
    var vm = this;
    vm.isSignedIn = function () {
        return Authenticate.isAuthenticated();
    };

    vm.checkAdmin  = function () {
        return Authenticate.isAdmin()
    }

    vm.logout  = function () {
        Authenticate.logout()
            .success(function () {
                $state.go("main.login");
            }).error(function () {
            });
    }
}
angular.module('seoControllers').controller('MainCtrl', MainCtrl);