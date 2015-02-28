function MainCtrl($scope, Authenticate) {
    var vm = this;
    vm.isSignedIn = function () {
        return Authenticate.isAuthenticated;
    };
}
angular.module('seoControllers').controller('MainCtrl', MainCtrl);