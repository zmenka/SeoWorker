'use strict';

function AuthCtrl($scope, $state, $alert, Authenticate) {
    var vm = this;
    vm.login = login;

    function login(user) {
        Authenticate.login(user)
            .then(function (res) {
                console.log("$scope.login ", res.data)
                $state.go("main.hello");
            }).catch(function (err) {
                console.log("$scope.login error ", err.data)
                if (err.data) {
                    $alert({
                        title: 'Внимание!', content: err.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: 'body'
                    });
                }
            });
    }

}

angular.module('seoControllers').controller('AuthCtrl', AuthCtrl);