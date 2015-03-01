'use strict';

function AuthCtrl($scope, $location, $alert, Authenticate) {
    var vm = this;
    vm.logout = logout;
    vm.login = login;
    vm.register = register;

    function logout () {
        Authenticate.logout()
            .success(function () {
                Authenticate.isAuthenticated = false;
                $location.path("/login");
            }).error(function () {
            });
    }

    function login (user) {
        Authenticate.login(user)
            .success(function (data, status, header) {
                console.log("$scope.login ", data)
                Authenticate.isAuthenticated = true
                $location.path("/sites");
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
    function register (user) {
        Authenticate.register(user)
            .success(function (data, status, header) {
                console.log("$scope.register", data)
//                    Authenticate.isAuthenticated = true
//                    $location.path("/sites");
                $alert({title: 'Внимание!', content: "Пользователь успешно зарегистрирован!",
                    placement: 'top', type: 'success', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });

            }).error(function (data) {
                console.log("$scope.register error ", data)
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