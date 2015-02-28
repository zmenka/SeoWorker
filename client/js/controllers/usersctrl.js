function UsersCtrl ($scope, $alert, Api) {
        $scope.user = null;
        $scope.users = [];
        $scope.loading = false;

        var load = function () {
            $scope.loading = true;
            $scope.user = null;
            Api.users()
                .then(function (res) {
                    console.log('users are reseived ', res.data);
                    $scope.users = res.data;
                })
                .catch(function (err) {
                    console.log('get users return ERROR!', err);
                    $scope.users = [];
                    $scope.loading = false;
                    $alert({title: 'Внимание!', content: "Ошибка при получении списка пользователей: " + err.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                });
        };
        load();
    }

angular.module('seoControllers').controller('UsersCtrl', UsersCtrl);

