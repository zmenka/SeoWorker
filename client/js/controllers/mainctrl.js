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
            .then(function () {
                $state.go("main.login");
            }).catch(function () {
            });
    }

    vm.userLogin = function () {
        return Authenticate.userLogin();
    }
}
angular.module('seoControllers').controller('MainCtrl', MainCtrl);