'use strict';

function ManageCtrl($scope, $state, $q, $alert, Authenticate, Api) {
    var vm = this;
    vm.register = register;
    vm.oneAtATime = true;
    vm.loading = false;
    vm.loadUser = loadUsers;
    vm.users = [];
    vm.startLoad = startLoad;
    vm.startDataLoaded = false;
    vm.loadUser();
    vm.isOpen = true;
    vm.form = null

    function register () {
        vm.loading = true;
        return Authenticate.register(vm.form)
            .success(function (data, status, header) {
                vm.loading = false;
                vm.form = null;
                console.log("$scope.register", data)
//                    Authenticate.isAuthenticated = true
//                    $location.path("/sites");
                $alert({title: 'Внимание!', content: "Пользователь успешно зарегистрирован!",
                    placement: 'top', type: 'warning', show: true,
                    duration: '3',
                    container: 'body'
                });
                vm.loadUser();

            }).error(function (data) {
                vm.loading = false;
                console.log("$scope.register error ", data)
                if (data.message) {
                    $alert({title: 'Внимание!', content: data.message,
                        placement: 'top', type: 'danger', show: true,
                        duration: '1',
                        "container": "body"
                    });
                } else if (data) {
                    $alert({title: 'Внимание!', content: data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        "container": "body"
                    });
                }
            });
    }

    function loadUsers() {
        vm.loading = true;
        return Api.users()
            .then(function (res) {
                console.log('users are reseived ', res.data);
                vm.users = res.data;
                vm.loading = false;
                vm.isOpen = true;
            })
            .catch(function (err) {
                console.log('get users return ERROR!', err.data);
                vm.users = [];
                vm.loading = false;
                $alert({title: 'Внимание!', content: "Ошибка при получении списка пользователей: " + err.data,
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            });
    };

    function startLoad (){
        return loadUsers()
            .then(function () {
                vm.startDataLoaded = true
            })
    }
}

angular.module('seoControllers').controller('ManageCtrl', ManageCtrl);