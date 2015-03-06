function SettingsCtrl ($scope, $alert, Api) {
    var vm = this;
        vm.url = null;
        vm.site = null;
        vm.sites = [];
//        vm.origin_site = null;
        vm.loading = false;
        vm.sengines = [];

        vm.selectSettings = selectSettings;

        var load = function () {
            vm.loading = true;
            Api.user_sites_and_tasks()
                .then(function (res) {
                    console.log("load Api.user_sites_and_tasks ", res);
                    vm.sites = res.data;
                }).then(function () {
                    return Api.sengines()
                })
                .then(function (res1) {
                    console.log('load Api.sengines ', res1);
                    vm.sengines = res1.data;
                    vm.loading = false;
                })
                .catch(function (err) {
                    console.log('load Api.user_sites_and_tasks err ', err);
                    vm.sites = [];
                    vm.site = null;
                    vm.sengines = null;
                    vm.loading = false;
                    $alert({title: 'Внимание!', content: "Ошибка при получении списка сайтов"
                        + (err.data ? ": " + err.data : "!"),
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                });
        };
        load();

        vm.addTask = function () {
            console.log("addTask", vm.site);

            if (!vm.site.data.usurl_id || !vm.site.data.condition_query || !vm.site.data.sengine_id
                || !vm.site.data.region || !vm.site.data.size_search) {
                $alert({title: 'Внимание!', content: "Не заполнены все необходимые поля. ",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
                return;
            }
            vm.loading = true;
            Api.create_task(vm.site.data.usurl_id, vm.site.data.condition_query, vm.site.data.sengine_id,
                vm.site.data.region, vm.site.data.size_search)
                .then(function () {
                    console.log('task is saved');

                    load();
                    vm.loading = false;
                    vm.site = null;
                    $alert({title: 'Задача добавлена',
                        placement: 'top', type: 'warning', show: true,
                        duration: '2',
                        container: '.alerts-container'
                    });
                })
                .catch(function (err) {
                    console.log('addTask Api.create_task err ', err);
                    vm.loading = false;
                    $alert({title: 'Внимание!', content: "Новая задача не создана: "
                        + (err.data ? ": " + err.data : "!"),
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                })
        };

        vm.newSite = function () {
            console.log("newSite ", vm.url);
            if ( !vm.url) {
                $alert({title: 'Внимание!', content: "Введите url. ",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
                return;
            }
            vm.loading = true;
            Api.create_site(vm.url)
                .then(function () {
                    vm.url = null;
                    // чтобы не показывалась форма
                    vm.site = null;
                    console.log('site is saved');
                    load();
                    vm.loading = false;
                    $alert({title: 'Запрс добавлен',
                        placement: 'top', type: 'warning', show: true,
                        duration: '2',
                        container: '.alerts-container'
                    });
                })
                .catch(function (response) {
                    console.log('newSite Api.create_site err ', response);
                    $alert({title: 'Внимание!', content: "Новый сайт не добавлен: "
                        + (err.data ? ": " + err.data : "!"),
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                    vm.loading = false;
                })
        };

        function selectSettings (node) {
            vm.site = node;
            console.log("selectSettings", node);

        };

        vm.IsTaskSelected = function () {
            if (vm.site && vm.site.type=='task') {
                return true;
            }
            return false;
        }

    vm.IsSiteSelected = function () {
        if (vm.site && vm.site.type=='page') {
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
