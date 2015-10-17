function SettingsCtrl($scope, $stateParams, $alert, Api, ModalApi) {
    var vm = this;
    vm.url = null;
    vm.site = {};
    vm.sites = [];
//        vm.origin_site = null;
    vm.loading = false;
    vm.sengines = [];
    vm.regions = [];
    vm.selectSettings = selectSettings;
    vm.removeTask = removeTask;
    console.log($scope.$emit);
    vm.initSite = function (site) {
        if (!site) {
            site = {data: {}}
        }
        if (!site.data) {
            site.data = {}
        }
        if (! site.data.sengine_id)
            site.data.sengine_id = 2
        if (! site.data.region_id)
            site.data.region_id = 181
        if (! site.data.size_search)
            site.data.size_search = 10

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
                vm.site = null;
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

        if (!vm.site.data.usurl_id || !vm.site.data.condition_query || !vm.site.data.sengine_id
            || !vm.site.data.size_search) {
            $alert({
                title: 'Внимание!', content: "Не заполнены все необходимые поля. ",
                placement: 'top', type: 'danger', show: true,
                duration: '3',
                container: 'body'
            });
            return;
        }

        if (vm.site.data.size_search > 20 || vm.site.data.size_search < 5) {
            $alert({
                title: 'Внимание!', content: "Неправильно заполнен размер выборки. " +
                "Он должен быть в диапазоне от 5 до 20.",
                placement: 'top', type: 'danger', show: true,
                duration: '3',
                container: 'body'
            });
            return;
        }

        vm.loading = true;
        return Api.create_task(vm.site.data.usurl_id, vm.site.data.condition_query, vm.site.data.sengine_id,
            vm.site.data.region_id, vm.site.data.size_search)
            .then(function () {
                console.log('task is saved');

                load();
                vm.loading = false;
                vm.site = null;
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

    vm.newSite = function () {
        console.log("newSite ", vm.url);
        if (!vm.url) {
            $alert({
                title: 'Внимание!', content: "Введите url. ",
                placement: 'top', type: 'danger', show: true,
                duration: '3',
                container: 'body'
            });
            return;
        }
        vm.loading = true;
        Api.create_site(vm.url, $stateParams.user_id)
            .then(function () {
                vm.url = null;
                // чтобы не показывалась форма
                vm.site = null;
                console.log('site is saved');
                load();
                vm.loading = false;
                $alert({
                    title: 'Запрос добавлен',
                    placement: 'top', type: 'warning', show: true,
                    duration: '2',
                    container: 'body'
                });
            })
            .catch(function (err) {
                console.log('newSite Api.create_site err ', err);
                $alert({
                    title: 'Внимание!', content: "Новый сайт не добавлен. "
                    + (err.data ? err.data : ""),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
                vm.loading = false;
            })
    };

    function selectSettings(node) {
        vm.site = node;
        vm.initSite(vm.site)
        console.log("selectSettings", node);
        $scope.collapsedSite = false;
    };

    function removeTask(node) {
        ModalApi.show()
            .then(function(confirm){
                console.log("removeTask", confirm, node);
                if (!confirm) {
                    return
                }
                var p;
                    if (node.type == 'task'){
                        vm.loading = true;
                        p = Api.remove_task(node.data.task_id)
                    }else if (node.type == 'page'){
                        p = Api.remove_site(node.data.usurl_id)
                    }
                if (p){
                    p
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
                }
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

    vm.changeSettings = function () {
        var res = false;
        if (vm.site) {
            //console.log("site_origin", vm.origin_site, vm.site)
            if (JSON.stringify(vm.origin_site) != JSON.stringify(vm.site))
                res = true;
        }
        return res;
    }

}

angular.module('seoControllers').controller('SettingsCtrl', SettingsCtrl);
