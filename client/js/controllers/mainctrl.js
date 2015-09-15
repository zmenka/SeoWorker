function MainCtrl($scope, $state,  Authenticate) {
    var vm = this;

    vm.Authenticate = Authenticate

    vm.logout  = function () {
        Authenticate.logout()
            .then(function () {
                $state.go("main.login");
            }).catch(function () {
            });
    }

}
angular.module('seoControllers').controller('MainCtrl', MainCtrl);