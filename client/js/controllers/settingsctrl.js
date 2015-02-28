function SettingsCtrl ($scope, $alert, Api) {
        $scope.formData = null;
        $scope.site = null;
        $scope.sites = [];
//        $scope.origin_site = null;
        $scope.loading = false;
        //true - site, false - task
//        $scope.siteOrTask = true;

        $scope.sengines = [];

        var load = function () {
            $scope.loading = true;
            Api.user_sites_and_tasks()
                .then(function (res) {
                    console.log('sites are reseived');
                    $scope.sites = createTree(res.data);
                })
                .then(function () {
                    return Api.sengines()
                })
                .then(function (res1) {
                    console.log('sengines are reseived');
                    $scope.sengines = res1.data;
                    $scope.loading = false;
                })
                .catch(function (err) {
                    console.log('get sites return ERROR!', err);
                    $scope.sites = [];
                    $scope.site = null;
                    $scope.loading = false;
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

//        $scope.remove = function (scope) {
//            //console.log("remove");
//            scope.remove();
//        };

        $scope.toggle = function (scope) {
            //console.log("toggle");
            scope.toggle();
        };

        $scope.addTask = function () {
            console.log("addTask", $scope.site);

            if (!$scope.site.usurl_id || !$scope.site.condition_query || !$scope.site.sengine_id
                || !$scope.site.region || !$scope.site.size_search) {
                $alert({title: 'Внимание!', content: "Не заполнены все необходимые поля. ",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
                return;
            }
            $scope.loading = true;
            Api.create_task($scope.site.usurl_id, $scope.site.condition_query, $scope.site.sengine_id,
                $scope.site.region, $scope.site.size_search)
                .then(function () {
                    console.log('task is saved');

                    load();
                    $scope.loading = false;
                    $scope.site = null;
                })
                .catch(function (response) {
                    console.log('task is saved WITH ERROR!', response);
                    $scope.loading = false;
                    $alert({title: 'Внимание!', content: "Новая задача не создана: " + response.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                })
        };

//        $scope.saveTask = function (params) {
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
//            $scope.loading = true;
//            Api.save_task(params.task_id, params.condition_query, params.sengine_id,
//            params.region, params.size_search)
//                .then(function () {
//                    console.log('task is saved');
//                    load();
//
//                    $scope.loading = false;
//                })
//                .catch(function (response) {
//                    console.log('task is saved WITH ERROR!', response);
//                    $scope.loading = false;
//                    $alert({title: 'Внимание!', content: "Изменения не сохранены: " + response.data,
//                        placement: 'top', type: 'danger', show: true,
//                        duration: '3',
//                        container: '.alerts-container'
//                    });
//                })
//        };


        $scope.newSite = function () {
            console.log("newSite");
            if (!$scope.formData || !$scope.formData.url) {
                $alert({title: 'Внимание!', content: "Не заполнены все необходимые поля. ",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
                return;
            }
            $scope.loading = true;
            Api.create_site($scope.formData.url)
                .then(function () {
                    $scope.formData = null;
                    // чтобы не показывалась форма
                    $scope.site = null;
                    console.log('site is saved');
                    load();
                    $scope.loading = false;
                })
                .catch(function (response) {
                    console.log('site is saved WITH ERROR!', response);
                    $alert({title: 'Внимание!', content: "Новый сайт не добавлен: " + response.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                    $scope.loading = false;
                })
        };

        $scope.select = function (scope) {
            //console.log("select");
            var nodeData = scope.$modelValue;
            $scope.site = JSON.parse(JSON.stringify(nodeData));
//            if (nodeData.task_id) {
//                $scope.siteOrTask = false
//                $scope.site = JSON.parse(JSON.stringify(nodeData));
//                $scope.origin_site = nodeData;
//            } else {
//                $scope.siteOrTask = true;
//                $scope.site = JSON.parse(JSON.stringify(nodeData));
//            }
            console.log("select", $scope.site)

        };

        $scope.IsSiteSelected = function () {
            if ($scope.site && $scope.site.task_id) {
                return false;
            }
            return true;
        }

        $scope.changeSettings = function () {
            var res = false;
            if ($scope.site) {
                //console.log("site_origin", $scope.origin_site, $scope.site)
                if (JSON.stringify($scope.origin_site) != JSON.stringify($scope.site))
                    res = true;
            }
            return res;
        }

    }

angular.module('seoControllers').controller('SettingsCtrl', SettingsCtrl);
