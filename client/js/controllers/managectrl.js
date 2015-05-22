'use strict';

function ManageCtrl($scope, $state, $alert, Authenticate, Api) {
    var vm = this;
    vm.register = register;
    vm.oneAtATime = true;
    vm.loading = false;
    vm.loadUser = loadUsers;
    vm.users = [];
    vm.loginAs = loginAs;

    vm.loadUser();

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

    function loadUsers() {
        vm.loading = true;
        Api.users()
            .then(function (res) {
                console.log('users are reseived ', res.data);
                vm.users = res.data;
            })
            .catch(function (err) {
                console.log('get users return ERROR!', err.data);
                vm.users = [];
                vm.loading = false;
                $alert({title: 'Внимание!', content: "Ошибка при получении списка пользователей: " + err.data,
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
            });
    };

    function loginAs(user_id){

    }

}

angular.module('seoControllers').controller('ManageCtrl', ManageCtrl);