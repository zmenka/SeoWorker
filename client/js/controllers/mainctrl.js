function MainCtrl($scope, Authenticate) {
    var vm = this;
    vm.isSignedIn = function () {
        return Authenticate.isAuthenticated;
    };
    vm.dropdown = [
        {
            "text": "<i class='glyphicon glyphicon-signal'></i>&nbsp;Графики",
            "href": "#/promotion/chart"
        },
        {
            "text": "<span class=\"glyphicon glyphicon-list-alt\"></span>&nbsp;Выдача",
            "href": "#/promotion/selection"
        }
    ];
    vm.hoveCarret = false;
}
angular.module('seoControllers').controller('MainCtrl', MainCtrl);