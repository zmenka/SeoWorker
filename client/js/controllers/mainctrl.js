function MainCtrl($scope, Authenticate) {
    $scope.isSignedIn = function () {
        return Authenticate.isAuthenticated;
    };
}
angular.module('seoControllers').controller('MainCtrl', MainCtrl);