'use strict';

function ManageCtrl($scope, $state, $alert, Authenticate) {
    var vm = this;
    vm.register = register;
    vm.oneAtATime = true;

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

angular.module('seoControllers').controller('ManageCtrl', ManageCtrl);