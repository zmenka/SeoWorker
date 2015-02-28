function SettingsCtrl ($scope, $alert, Api) {
    var vm = this;
        vm.formData = null;
        vm.site = null;
        vm.sites = [];
//        vm.origin_site = null;
        vm.loading = false;
        //true - site, false - task
//        vm.siteOrTask = true;

        vm.sengines = [];

        var load = function () {
            vm.loading = true;
            Api.user_sites_and_tasks()
                .then(function (res) {
                    console.log('sites are reseived');
                    vm.sites = createTree(res.data);
                })
                .then(function () {
                    return Api.sengines()
                })
                .then(function (res1) {
                    console.log('sengines are reseived');
                    vm.sengines = res1.data;
                    vm.loading = false;
                })
                .catch(function (err) {
                    console.log('get sites return ERROR!', err);
                    vm.sites = [];
                    vm.site = null;
                    vm.loading = false;
                    $alert({title: 'Внимание!', content: "Список сайтов не получен: " + err.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                });
        };
        load();

        var createTree = function (sites) {
            if (!sites) {
                return [];
            }
            var tree = [];
            for (var i = 0; i < sites.length; i++) {
                var f = function (site) {
                    //console.log("site", site);
                    //var domen = sites[i].url.match(/(?:http:\/\/|https:\/\/|)(?:www.|)([^\/]+)\/?(.*)/)[1];
                    //console.log("dom
                    // en", domen);

                    var result = tree.filter(function (v) {
                        return v.title === site.url;
                    })
                    //console.log("match", result);
                    if (!site.task_id) {
                        var s = null
                    } else {
                        var s = {title: site.condition_query, nodes: [], usurl_id: site.usurl_id, task_id: site.task_id, url: site.url,
                            condition_id: site.condition_id, condition_query: site.condition_query, sengine_id: site.sengine_id, region: site.region, size_search: site.size_search};
                    }
                    var row
                    if (result.length > 0) {
                        row = result[0];
                    } else {
                        row = {title: site.url, url: site.url, usurl_id: site.usurl_id, nodes: []}
                        tree.push(row)
                    }
                    if (s) {
                        row.nodes.push(s)
                    }


                };
                f(sites[i]);
            }
            console.log("sites ", sites, " tree ", tree);
            return tree;
        };

//        vm.remove = function (scope) {
//            //console.log("remove");
//            scope.remove();
//        };

        vm.toggle = function (scope) {
            //console.log("toggle");
            scope.toggle();
        };

        vm.addTask = function () {
            console.log("addTask", vm.site);

            if (!vm.site.usurl_id || !vm.site.condition_query || !vm.site.sengine_id
                || !vm.site.region || !vm.site.size_search) {
                $alert({title: 'Внимание!', content: "Не заполнены все необходимые поля. ",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
                return;
            }
            vm.loading = true;
            Api.create_task(vm.site.usurl_id, vm.site.condition_query, vm.site.sengine_id,
                vm.site.region, vm.site.size_search)
                .then(function () {
                    console.log('task is saved');

                    load();
                    vm.loading = false;
                    vm.site = null;
                })
                .catch(function (response) {
                    console.log('task is saved WITH ERROR!', response);
                    vm.loading = false;
                    $alert({title: 'Внимание!', content: "Новая задача не создана: " + response.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                })
        };

//        vm.saveTask = function (params) {
//            console.log("saveTask", params);
//
//            if (!params.task_id || !params.condition_query || !params.sengine_id
//                || !params.region || !params.size_search) {
//                $alert({title: 'Внимание!', content: "Нет всех необходимых полей. ",
//                    placement: 'top', type: 'danger', show: true,
//                    duration: '3',
//                    container: '.alerts-container'
//                });
//                return;
//            }
//            vm.loading = true;
//            Api.save_task(params.task_id, params.condition_query, params.sengine_id,
//            params.region, params.size_search)
//                .then(function () {
//                    console.log('task is saved');
//                    load();
//
//                    vm.loading = false;
//                })
//                .catch(function (response) {
//                    console.log('task is saved WITH ERROR!', response);
//                    vm.loading = false;
//                    $alert({title: 'Внимание!', content: "Изменения не сохранены: " + response.data,
//                        placement: 'top', type: 'danger', show: true,
//                        duration: '3',
//                        container: '.alerts-container'
//                    });
//                })
//        };


        vm.newSite = function () {
            console.log("newSite");
            if (!vm.formData || !vm.formData.url) {
                $alert({title: 'Внимание!', content: "Не заполнены все необходимые поля. ",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
                return;
            }
            vm.loading = true;
            Api.create_site(vm.formData.url)
                .then(function () {
                    vm.formData = null;
                    // чтобы не показывалась форма
                    vm.site = null;
                    console.log('site is saved');
                    load();
                    vm.loading = false;
                })
                .catch(function (response) {
                    console.log('site is saved WITH ERROR!', response);
                    $alert({title: 'Внимание!', content: "Новый сайт не добавлен: " + response.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                    vm.loading = false;
                })
        };

        vm.select = function (scope) {
            //console.log("select");
            var nodeData = scope.$modelValue;
            vm.site = JSON.parse(JSON.stringify(nodeData));
//            if (nodeData.task_id) {
//                vm.siteOrTask = false
//                vm.site = JSON.parse(JSON.stringify(nodeData));
//                vm.origin_site = nodeData;
//            } else {
//                vm.siteOrTask = true;
//                vm.site = JSON.parse(JSON.stringify(nodeData));
//            }
            console.log("select", vm.site)

        };

        vm.IsSiteSelected = function () {
            if (vm.site && vm.site.task_id) {
                return false;
            }
            return true;
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
