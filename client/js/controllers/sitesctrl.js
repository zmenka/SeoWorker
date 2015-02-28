function SitesCtrl ($scope, $alert, Api, CaptchaModal) {
        $scope.site = null;
        $scope.sites = [];
        $scope.params = [];
        $scope.params1 = [];
        $scope.chart = null;
        $scope.values = null;
        $scope.site_params = null;
        $scope.loading = false;
        $scope.captcha = null;
        $scope.oneAtATime = true;

        var load = function () {
            $scope.loading = true;
            Api.user_sites_and_tasks()
                .then(function (res) {
                    console.log('sites are reseived');
                    $scope.sites = createTree(res.data);
                    $scope.loading = false;
                })
                .catch(function (err) {
                    console.log('get sites return ERROR!', err);
                    $scope.sites = [];
                    $scope.loading = false;
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

        $scope.getParams = function () {
            if (!$scope.site || !$scope.site.condition_id || !$scope.site.url_id) {
                $alert({title: 'Внимание!', content: "Нет всех необходимых данных для запроса.",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
                return;
            }
            $scope.loading = true;
            return Api.get_params($scope.site.url_id, $scope.site.condition_id)
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
                          
                        $scope.site_params = res.data.site_params[0]
                        
                        $scope.params = res.data.paramsDiagram;
                        $scope.params1 = res.data.paramsTable;
                        $scope.site.position = res.data.paramsPosition;
                        
                        $scope.chart = null
                        $scope.values = null
                        $scope.chart1 = null
                        $scope.values1 = null

                    } else {
                        $scope.params = [];
                        $scope.params1 = [];
                        $scope.site_params = null;
                    }
                    $scope.loading = false;
                })
                .catch(function (err) {
                    console.log("параметры НЕ получены, ", err)
                    $scope.params = [];
                    $scope.params1 = [];
                    $scope.site_params = null;
                    $scope.loading = false;
                    $alert({title: 'Внимание!', content: "Параметры не получены: " + err.data,
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });
                })
        }

        $scope.calcParams = function () {
            if (!$scope.site) {
                $alert({title: 'Внимание!', content: "Нет всех необходимых данных для запроса.",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
                return;
            }
            $scope.loading = true;

            Api.calc_params($scope.site.url, $scope.site.condition_id, $scope.captcha)
                .then(function (res) {
                    console.log("параметры получены", res.data);
                    $scope.loading = false;
                    $scope.captcha = null;
                    $scope.getParams();
                })
                .catch(function (err) {
                    $scope.loading = false;
                    $scope.captcha = null;

                    if (err.data.captcha) {
                        $scope.captcha = err.data.captcha;
                        console.log("Получили капчу", err.data);

                        CaptchaModal.show($scope.captcha.img)
                            .then(function (result) {
                                if (result.answer && result.captcha) {
                                    console.log('Капча введена, посылаем повторно запрос.')

                                    $scope.captcha.rep = result.captcha;
                                    $scope.calcParams();
                                } else {
                                    console.log('Вы не ввели капчу или нажали "Отмена". Попробуйте еще раз.')
                                }
                            })
                    } else {
                        console.log("параметры НЕ получены, ", err)
                        $scope.params = [];
                        $scope.params1 = [];
                        $alert({title: 'Внимание!', content: "Параметры не получены: " + err.data,
                            placement: 'top', type: 'danger', show: true,
                            duration: '3',
                            container: '.alerts-container'
                        });
                    }
                })
        }

        $scope.toggle = function (scope) {
            //console.log("toggle");
            scope.toggle();
        };

        $scope.select = function (scope) {
            //console.log("select");
            var nodeData = scope.$modelValue;
            if (nodeData.task_id) {
                $scope.site = nodeData
                $scope.params = [];
                $scope.params1 = [];
            } else {
                $scope.site = null
                $scope.params = [];
                $scope.params1 = [];
            }

        };

    }
angular.module('seoControllers').controller('SitesCtrl', SitesCtrl);
