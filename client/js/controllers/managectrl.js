'use strict';

function ManageCtrl($scope, $state, $q, $alert, Authenticate, Api) {
    var vm = this;
    vm.Authenticate = Authenticate;
    vm.register = register;
    vm.oneAtATime = true;
    vm.loading = false;
    vm.loadUser = loadUsers;
    vm.users = [];
    vm.roles = [];
    vm.groups = [];
    vm.group = null;
    vm.startLoad = startLoad;
    vm.startDataLoaded = false;
    vm.isOpen = true;
    vm.form = null

    vm.startLoad();

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

    function loadGroups (){
        vm.loading = true;
        return Api.groups()
            .then(function (res1) {
                console.log('Api groups ', res1.data);
                vm.groups = res1.data;
                vm.loading = false;
            })
            .catch(function (err) {
                console.log('get groups return ERROR!', err.data);
                vm.loading = false;
                vm.groups = []
                $alert({title: 'Внимание!', content: "Ошибка при получении групп.",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            })
    }

    vm.addGroup = function () {
        if (!vm.group) {
            $alert({
                title: 'Внимание!', content: "Введите название группы. ",
                placement: 'top', type: 'danger', show: true,
                duration: '3',
                container: 'body'
            });
            return;
        }
        vm.loading = true;
        return Api.create_group(vm.group)
            .then(function () {
                vm.group = null;
                vm.loading = false;
                loadGroups();
                $alert({
                    title: 'Группа добавлена',
                    placement: 'top', type: 'warning', show: true,
                    duration: '2',
                    container: 'body'
                });
            })
            .catch(function (err) {
                console.log('newSite Api.create_group err ', err);
                $alert({
                    title: 'Внимание!', content: "Новая группа не добавлена. "
                    + (err.data ? err.data : ""),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
                vm.loading = false;
            })
    };

    function startLoad (){
        return loadUsers()
            .then(function () {
                return loadGroups()
            })
            .then(function () {
                vm.loading = true;
                return Api.roles()
            })
            .then(function (res) {
                console.log('Api roles ', res.data);
                vm.roles = res.data;
                vm.loading = false;
            })
            .catch(function (err) {
                console.log('get dops return ERROR!', err.data);
                vm.loading = false;
                $alert({title: 'Внимание!', content: "Ошибка при получении ролей.",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            })
            .then(function () {
                vm.startDataLoaded = true
            })
    }
}

angular.module('seoControllers').controller('ManageCtrl', ManageCtrl);