'use strict';

function AuthCtrl($scope, $state, $alert, Authenticate) {
    var vm = this;
    vm.login = login;

    function login (user) {
        Authenticate.login(user)
            .success(function (data, status, header) {
                console.log("$scope.login ", data)
                $state.go("main.promotion.chart");
            }).error(function (data) {
                console.log("$scope.login error ", data)
                if (data.message) {
                    $alert({title: 'Внимание!', content: data.message,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                } else if (data) {
                    $alert({title: 'Внимание!', content: data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                }
            });
    }

}

angular.module('seoControllers').controller('AuthCtrl', AuthCtrl);