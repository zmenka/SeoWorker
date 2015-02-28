function SitesCtrl ($scope, $alert, Api, CaptchaModal) {
    var vm = this;
        vm.site = null;
        vm.sites = [];
        vm.params = [];
        vm.params1 = [];
        vm.chart = null;
        vm.values = null;
        vm.site_params = null;
        vm.loading = false;
        vm.captcha = null;
        vm.oneAtATime = true;

        var load = function () {
            vm.loading = true;
            Api.user_sites_and_tasks()
                .then(function (res) {
                    console.log('sites are reseived');
                    vm.sites = createTree(res.data);
                    vm.loading = false;
                })
                .catch(function (err) {
                    console.log('get sites return ERROR!', err);
                    vm.sites = [];
                    vm.loading = false;
                    $alert({title: 'Внимание!', content: "Ошибка при получении списка сайтов: " + err.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                });
        };
        load();

        var createTree = function (sites) {
            if (!sites || sites.length == 0) {
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
                        var s = {title: site.condition_query, nodes: [], usurl_id: site.usurl_id, url_id: site.url_id, task_id: site.task_id, url: site.url,
                            condition_id: site.condition_id, condition_query: site.condition_query, sengine_name: site.sengine_name,
                            region: site.region, size_search: site.size_search};
                    }
                    var row
                    if (result.length > 0) {
                        row = result[0];
                    } else {
                        row = {title: site.url, usurl_id: site.usurl_id, url_id: site.url_id, nodes: []}
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

        vm.getParams = function () {
            if (!vm.site || !vm.site.condition_id || !vm.site.url_id) {
                $alert({title: 'Внимание!', content: "Нет всех необходимых данных для запроса.",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
                return;
            }
            vm.loading = true;
            return Api.get_params(vm.site.url_id, vm.site.condition_id)
                .then(function (res) {
//                var url = 'files/' + site.path;
//                console.log(url);
//                $window.open(url);
                    console.log("параметры получены", res);
                    if (res.data && 
                        res.data.paramsDiagram.length > 0 && 
                        res.data.paramsTable.length > 0 && 
                        //res.data.paramsPosition.length > 0 && 
                        res.data.site_params.length > 0) {
                          
                        vm.site_params = res.data.site_params[0]
                        
                        vm.params = res.data.paramsDiagram;
                        vm.params1 = res.data.paramsTable;
                        vm.site.position = res.data.paramsPosition;
                        
                        vm.chart = null
                        vm.values = null
                        vm.chart1 = null
                        vm.values1 = null

                    } else {
                        vm.params = [];
                        vm.params1 = [];
                        vm.site_params = null;
                    }
                    vm.loading = false;
                })
                .catch(function (err) {
                    console.log("параметры НЕ получены, ", err)
                    vm.params = [];
                    vm.params1 = [];
                    vm.site_params = null;
                    vm.loading = false;
                    $alert({title: 'Внимание!', content: "Параметры не получены: " + err.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                })
        }

        vm.calcParams = function () {
            if (!vm.site) {
                $alert({title: 'Внимание!', content: "Нет всех необходимых данных для запроса.",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
                return;
            }
            vm.loading = true;

            Api.calc_params(vm.site.url, vm.site.condition_id, vm.captcha)
                .then(function (res) {
                    console.log("параметры получены", res.data);
                    vm.loading = false;
                    vm.captcha = null;
                    vm.getParams();
                })
                .catch(function (err) {
                    vm.loading = false;
                    vm.captcha = null;

                    if (err.data.captcha) {
                        vm.captcha = err.data.captcha;
                        console.log("Получили капчу", err.data);

                        CaptchaModal.show(vm.captcha.img)
                            .then(function (result) {
                                if (result.answer && result.captcha) {
                                    console.log('Капча введена, посылаем повторно запрос.')

                                    vm.captcha.rep = result.captcha;
                                    vm.calcParams();
                                } else {
                                    console.log('Вы не ввели капчу или нажали "Отмена". Попробуйте еще раз.')
                                }
                            })
                    } else {
                        console.log("параметры НЕ получены, ", err)
                        vm.params = [];
                        vm.params1 = [];
                        $alert({title: 'Внимание!', content: "Параметры не получены: " + err.data,
                            placement: 'top', type: 'danger', show: true,
                            duration: '3',
                            container: '.alerts-container'
                        });
                    }
                })
        }

        vm.toggle = function (scope) {
            //console.log("toggle");
            scope.toggle();
        };

        vm.select = function (scope) {
            //console.log("select");
            var nodeData = scope.$modelValue;
            if (nodeData.task_id) {
                vm.site = nodeData
                vm.params = [];
                vm.params1 = [];
            } else {
                vm.site = null
                vm.params = [];
                vm.params1 = [];
            }

        };

    }
angular.module('seoControllers').controller('SitesCtrl', SitesCtrl);
