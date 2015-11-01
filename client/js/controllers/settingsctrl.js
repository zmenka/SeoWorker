function SettingsCtrl($scope, $stateParams, $alert, Api, ModalApi) {
    var vm = this;
    vm.sites = [];
//        vm.origin_site = null;
    vm.loading = false;
    vm.sengines = [];
    vm.regions = [];
    vm.selectSettings = selectSettings;
    vm.removeTask = removeTask;

    vm.new_url = "";
    vm.new_condition_query = '';
    vm.new_sengine_id = "";
    vm.new_region_id = "";

    var yandex_id = ""
    var ekb_id = ""

    vm.initSite = function () {
        vm.new_url = "";
        vm.new_condition_query = '';
        vm.new_sengine_id = yandex_id;
        vm.new_region_id = ekb_id;
    }


    var load = function () {
        vm.loading = true;
        return Api.user_sites_and_tasks($stateParams.user_id, true)
            .then(function (res) {
                console.log("load Api.user_sites_and_tasks ", res);
                vm.sites = res.data;
                vm.loading = false;
            })
            .catch(function (err) {
                console.log('load Api.user_sites_and_tasks err ', err);
                vm.sites = [];
                $alert({
                    title: 'Внимание!', content: "Ошибка при получении списка сайтов"
                    + (err.data ? ": " + err.data : "!"),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            });
    };

    var startload = function () {
        return load()
            .then(function () {
                vm.loading = true;
                return Api.sengines()
            })
            .then(function (res1) {
                console.log('load Api.sengines ', res1);
                vm.sengines = res1.data;
                return Api.regions()
            })
            .then(function (res2) {
                console.log('load Api.regions ', res2);
                vm.regions = res2.data;
                vm.loading = false;

                var yandex = vm.sengines.filter(function (el) {
                    return el.sengine_name == 'Yandex'
                })[0]
                yandex_id = yandex ? yandex.sengine_id : ""

                var ekb = vm.regions.filter(function (el) {
                    return el.region_name == 'Екатеринбург'
                })[0]
                ekb_id = ekb ? ekb.region_id : ""
                vm.initSite()
            })
            .catch(function (err) {
                console.log('startload err ', err);
                vm.loading = false;
                $alert({
                    title: 'Внимание!', content: "Ошибка при получении дополнительной информации"
                    + (err.data ? ": " + err.data : "!"),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            });
    };
    startload();

    vm.addTask = function () {
        console.log("addTask", vm.site);

        if (!vm.new_url || !vm.new_condition_query || !vm.new_sengine_id
            || !vm.new_region_id) {
            $alert({
                title: 'Внимание!', content: "Не заполнены все необходимые поля. ",
                placement: 'top', type: 'danger', show: true,
                duration: '3',
                container: 'body'
            });
            return;
        }

        vm.loading = true;
        return Api.create_task($stateParams.user_id, vm.new_condition_query, vm.new_sengine_id,
            vm.new_region_id, vm.new_url)
            .then(function () {
                console.log('task is saved');

                load();
                vm.loading = false;
                vm.initSite()
                $alert({
                    title: 'Задача добавлена',
                    placement: 'top', type: 'warning', show: true,
                    duration: '2',
                    container: 'body'
                });
            })
            .catch(function (err) {
                console.log('addTask Api.create_task err ', err);
                vm.loading = false;
                $alert({
                    title: 'Внимание!', content: "Новая задача не создана. "
                    + (err.data ? err.data : ""),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            })
    };

    function selectSettings(node) {
        console.log("selectSettings", node);
    };

    function removeTask(node) {
        ModalApi.show()
            .then(function (confirm) {
                console.log("removeTask", confirm, node);
                if (!confirm) {
                    return
                }
                vm.loading = true;
                return Api.remove_task(node.data.uscondurl_id)
                    .then(function () {
                        vm.loading = false;
                        return load()
                    })
                    .catch(function (err) {
                        console.log('load Api...._remove err ', err.data);
                        vm.loading = false;
                        $alert({
                            title: 'Внимание!', content: "Ошибка при удалении. ",
                            placement: 'top', type: 'danger', show: true,
                            duration: '3',
                            container: 'body'
                        });
                    });

            })

    };

    vm.IsTaskSelected = function () {
        if (vm.site && vm.site.type == 'task') {
            return true;
        }
        return false;
    }

    vm.IsSiteSelected = function () {
        if (vm.site && vm.site.type == 'page') {
            return true;
        }
        return false;
    }

}

angular.module('seoControllers').controller('SettingsCtrl', SettingsCtrl);
