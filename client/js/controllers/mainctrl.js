function MainCtrl($scope, $state,  Authenticate) {
    var vm = this;
    vm.isSignedIn = function () {
        return Authenticate.isAuthenticated();
    };

    vm.checkRole  = function () {
        if (!Authenticate.getUser())
            return false
        return Authenticate.isAdmin() || Authenticate.getUser().groups.length > 0
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

    vm.userId = function () {
        return Authenticate.userId();
    }
}
angular.module('seoControllers').controller('MainCtrl', MainCtrl);