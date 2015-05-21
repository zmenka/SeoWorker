'use strict';

function UserCtrl($scope, $state, $stateParams, $alert, Authenticate, Api) {
    var vm = this;
    vm.editUser = editUser;
    vm.getUser = getUser;
    vm.user = null;

    vm.getUser();

    function getUser () {
        if (!$stateParams.user_id){
            console.log('UserCtrl.getUser user_id not fount')
            return;
        }
        Api.user($stateParams.user_id)
            .then(function (res) {
                console.log("getUser ", res.data)
                vm.user = res.data;
            }).catch(function (err) {
                console.log("getUser error ", err.data)
                vm.user = null;
                if (err.data) {
                    $alert({title: 'Внимание!', content: "Данный пользователя не получены. " + err.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                }else if (err) {
                    $alert({title: 'Внимание!', content: 'Данный пользователя не получены. ' + err,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                }
            });
    }

    function editUser (user) {
        if (!user){
            console.log('UserCtrl.getUser user not fount')
            return;
        }

        Api.edit_user(user.user_id, user.new_pasw, user.disabled, user.disabled_message)
            .then(function (res) {
                console.log("editUser ", res)
                $alert({title: '', content: 'Пользователь успешно обновлен!',
                    placement: 'top', type: 'info', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
            }).catch(function (err) {
                console.log("editUser error ", err)
                if (err.data) {
                    $alert({title: 'Внимание!', content: 'Изменения не сохранены. ' + err.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                } else if (err) {
                    $alert({title: 'Внимание!', content: 'Изменения не сохранены. ' + err,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                }
            });
    }

}

angular.module('seoControllers').controller('UserCtrl', UserCtrl);