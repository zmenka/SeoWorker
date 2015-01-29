'use strict';
/* Controllers */
var seoControllers = angular.module('seoControllers', []);
seoControllers.controller('MainCtrl', ['$scope', 'Authenticate',
    function ($scope, Authenticate) {
        $scope.isSignedIn = function () {
            return Authenticate.isAuthenticated;
        };
    }]);
seoControllers.controller('SitesCtrl', ['$scope', '$alert', 'Api', 'CaptchaModal',
    function ($scope, $alert, Api, CaptchaModal) {
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
                    if (res.data && res.data.all_params && res.data.all_params.length > 0
                        && res.data.site_params && res.data.site_params.length > 0) {
                        $scope.params = $scope.prettyDiagram(res.data.all_params, res.data.site_params[0]);
                        $scope.chart = null
                        $scope.values = null
                        $scope.params1 = $scope.prettyTable(res.data.all_params, res.data.site_params[0]);
                        $scope.chart1 = null
                        $scope.values1 = null
                        $scope.site_params = res.data.site_params[0]
                        var position = (res.data.all_params).filter(function (v) {
                            return v.url === $scope.site_params.url;
                        })[0]
                        $scope.site.position = position ? position.position: null;
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
        $scope.prettyDiagram = function (data, site_data) {

            if (!data || data.length == 0 || !site_data) {
                return
            }
            var diagram = []
            for (var key in data) {
                var position = data[key].position;
                for (var key1 in data[key].param.params) {
                    var current_par = data[key].param.params[key1]
                    if (current_par.success) {
                        var cur_val = parseFloat(current_par.val)
                        var result = diagram.filter(function (v) {
                            return v.key === current_par.ru_name;
                        })
                        var serial = {key: current_par.ru_name, values: [
                            [position, cur_val]
                        ], yrange: 0}
                        if (result.length > 0) {
                            if (cur_val > result[0].yrange) {
                                result[0].yrange = cur_val;
                            }
                            result[0].values.push([position, cur_val])

                        } else {
                            diagram.push(serial)
                        }
                    }

                }
            }
            var diagramExt = [];
            for (var key in diagram) {
                var result = site_data.param.params.filter(function (v) {
                    return v.ru_name === diagram[key].key;
                })
                if (result.length > 0 && result[0].success) {
                    diagramExt.push({key: diagram[key].key,
                        values: [
                            diagram[key],
                            {
                                key: 'Ваш сайт',
                                values: [
                                    [0, parseFloat(result[0].val)],
                                    [diagram[key].values[diagram[key].values.length - 1][0], parseFloat(result[0].val)]
                                ],
                                color: 'red'
                            }
                        ]
                    })
                }
            }

            console.log("prettyDiagram", diagramExt, diagram)
//            $scope.chart = null
//            $scope.values = $scope.chart.values;
            return diagramExt;
        }

        $scope.prettyTable = function (data, site_data) {
            if (!data || data.length == 0 || !site_data) {
                return
            }
//            data = data.sort(function (a, b) {
//                return a.position - b.position;
//            })
            var table = []
            for (var key in data) {
                var name = data[key].url.length > 60 ? data[key].url.substr(0, 60) + '...' : data[key].url
                table.push({url: data[key].url, name: name, params: data[key].param.params, surl: data[key].surl,
                    position: data[key].position})
            }

            table.push({url: site_data.url, name: 'Ваш сайт', params: site_data.param.params, surl: "-"})
            console.log("prettyTable", data, table)
//            $scope.chart1 = table[0]
//            $scope.values1 = $scope.chart1.params
            return table;
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

    }]);

seoControllers.controller('SettingsCtrl', ['$scope', '$alert', 'Api',
    function ($scope, $alert, Api) {
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

        $scope.IsSiteSelected = function (){
            if ($scope.site && $scope.site.task_id){
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

    }]);


seoControllers.controller('AuthCtrl', ['$scope', '$http', '$location', '$cookies', '$alert', 'Authenticate',
    function ($scope, $http, $location, $cookies, $alert, Authenticate) {

        $scope.logout = function () {
            Authenticate.logout()
                .success(function () {
                    Authenticate.isAuthenticated = false;
                    $location.path("/login");
                }).error(function () {
                });
        };
        $scope.login = function (user) {
            Authenticate.login(user)
                .success(function (data, status, header) {
                    console.log("$scope.login ", data)
                    Authenticate.isAuthenticated = true
                    $location.path("/sites");
                }).error(function (data) {
                    console.log("$scope.login error ", data)
                    if (data.message) {
                        $alert({title: 'Внимание!', content: data.message,
                            placement: 'top', type: 'danger', show: true,
                            duration: '3',
                            container: '.alerts-container'
                        });
                    } else if (data) {
                        $alert({title: 'Внимание!', content: data,
                            placement: 'top', type: 'danger', show: true,
                            duration: '3',
                            container: '.alerts-container'
                        });
                    }
                });
        };
        $scope.register = function (user) {
            Authenticate.register(user)
                .success(function (data, status, header) {
                    console.log("$scope.register", data)
//                    Authenticate.isAuthenticated = true
//                    $location.path("/sites");
                    $alert({title: 'Внимание!', content: "Пользователь успешно зарегистрирован!",
                        placement: 'top', type: 'success', show: true,
                        duration: '3',
                        container: '.alerts-container'
                    });

                }).error(function (data) {
                    console.log("$scope.register error ", data)
                    if (data.message) {
                        $alert({title: 'Внимание!', content: data.message,
                            placement: 'top', type: 'danger', show: true,
                            duration: '3',
                            container: '.alerts-container'
                        });
                    } else if (data) {
                        $alert({title: 'Внимание!', content: data,
                            placement: 'top', type: 'danger', show: true,
                            duration: '3',
                            container: '.alerts-container'
                        });
                    }
                });
        };
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

seoControllers.controller('UsersCtrl', ['$scope', '$alert', 'Api',
    function ($scope, $alert, Api) {
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
    }])


