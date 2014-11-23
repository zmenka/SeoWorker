'use strict';
/* Controllers */
var seoControllers = angular.module('seoControllers', []);

seoControllers.controller('MainCtrl', ['$scope', 'Api', 'CaptchaModal',
    function ($scope, Api, CaptchaModal) {
        $scope.formData = { url: ""};
        $scope.site = null;
        $scope.sites = [];
        $scope.origin_site = null;
        $scope.params = [];
        $scope.loading = false;
        $scope.captcha = null;

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
                            condition_id: site.condition_id, condition_query: site.condition_query};
                    }
                    var row
                    if (result.length > 0) {
                        row = result[0];
                    } else {
                        row = {title: site.url, usurl_id: site.usurl_id, nodes: []}
                        tree.push(row)
                    }
                    if (s) {
                        row.nodes.push(s)
                    }


                };
                f(sites[i]);
            }
            console.log(sites, tree);
            return tree;
        };

        $scope.getParams = function () {
            if (!$scope.site) {
                return;
            }
            $scope.loading = true;
            Api.get_params($scope.site.condition_id)
                .then(function (res) {
//                var url = 'files/' + site.path;
//                console.log(url);
//                $window.open(url);
                    console.log("параметры получены");
                    $scope.params = res.data;
                    $scope.loading = false;
                })
                .catch(function (err) {
                    console.log("параметры НЕ получены, ", err)
                    $scope.params = [];
                    $scope.loading = false;
                })
        }

        $scope.calcParams = function () {
            if (!$scope.site) {
                return;
            }
            $scope.loading = true;
            Api.calc_params($scope.site.condition_id,$scope.captcha )
                .then(function (res) {
                    console.log("параметры получены", res.data);
                    $scope.params = res.data.params;
                    $scope.loading = false;
                    $scope.captcha = null;
                })
                .catch(function (err) {
                    $scope.loading = false;
                    $scope.captcha = null;

                    if (err.data.captcha) {
                        $scope.captcha = err.data.captcha;
                        console.log("Получили капчу" ,err.data);

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
                    }
                })
        }


        $scope.remove = function (scope) {
            //console.log("remove");
            scope.remove();
        };

        $scope.toggle = function (scope) {
            //console.log("toggle");
            scope.toggle();
        };

        $scope.addTask = function (params) {
            console.log("addTask", params);

            if (!params.usurl_id || !params.condition_query) {
                return;
            }
            $scope.loading = true;
            Api.create_task(params.usurl_id, params.condition_query)
                .then(function () {
                    console.log('task is saved');
                    load();
                    $scope.loading = false;
                })
                .catch(function (response) {
                    console.log('task is saved WITH ERROR!', response);
                    $scope.loading = false;
                })
        };

        $scope.newSite = function () {
            console.log("newSite");
            if (!$scope.formData.url) {
                return;
            }
            $scope.loading = true;
            Api.create_site($scope.formData.url)
                .then(function () {
                    $scope.formData.url = "";
                    console.log('site is saved');
                    load();
                    $scope.loading = false;
                })
                .catch(function (response) {
                    console.log('site is saved WITH ERROR!', response);
                    $scope.loading = false;
                })
        };

        $scope.select = function (scope) {
            //console.log("select");
            var nodeData = scope.$modelValue;
            if (nodeData.task_id) {
                $scope.site = JSON.parse(JSON.stringify(nodeData));
                $scope.origin_site = nodeData;
                $scope.params = [];
            }

        };

        $scope.changeSettings = function () {
            var res = false;
            if ($scope.site) {
                //console.log("site_origin", $scope.origin_site, $scope.site)
                if (JSON.stringify($scope.origin_site) != JSON.stringify($scope.site))
                    res = true;
            }
            return res;
        }

        $scope.saveSettings = function () {

        }

    }]);

seoControllers.controller('CaptchaTestCtrl', ['$scope', 'CaptchaModal', 'Captcha',
    function ($scope, CaptchaModal, Captcha) {
        $scope.state = 'Ждем команды "Начать".'
        $scope.test_url = 'http://yandex.ru/yandsearch?text=погода';
        $scope.captcha = null;
        $scope.cookies = null;

        $scope.test = function () {
            $scope.state = "Посылаем запрос к яндексу"
            Captcha.test($scope.test_url, $scope.captcha, $scope.cookies)
                .then(function (res) {
                    console.log("первый результат", res.data)
                    $scope.cookies = res.data.cookies;

                    if (res.data.captcha) {
                        $scope.captcha = res.data.res;
                        $scope.state = "Получили капчу" + JSON.stringify($scope.captcha);

                        CaptchaModal.show($scope.captcha.img)
                            .then(function (result) {
                                if (result.answer && result.captcha) {
                                    $scope.state = 'Капча введена, посылаем повторно запрос.'

                                    $scope.captcha.rep = result.captcha;
                                    $scope.test();
                                } else {
                                    $scope.state = 'Вы не ввели капчу или нажали "Отмена". Попробуйте еще раз.'
                                }
                            })
                    } else {
                        $scope.captcha = null;
                        $scope.state = "Запрос сервера завершен нормально";
                    }

                })
                .catch(function (err) {
                    $scope.captcha = null;
                    //$scope.cookies = null;
                    console.log("Ошбика получения результата", err)
                    $scope.state = "Какие-то проблемы. Попробуйте еще раз."
                })

        }
    }]);


