function SitesCtrl ($scope, $alert, $aside, Api, CaptchaModal) {
    var vm = this;
        vm.site = null;
        vm.sites = [];
        vm.params = null;
        vm.params1 = null;
        vm.chart = null;
        vm.values = null;
        vm.site_params = null;
        vm.loading = false;
        vm.captcha = null;
        vm.oneAtATime = true;

    vm.showAside = showAside;

    function showAside(){
        var myAside = $aside({scope: $scope, show: true,
            placement: "left", animation: "am-slide-left",
            container: ".app-content", template: 'partials/sites_aside_template.html'});

        // Pre-fetch an external template populated with a custom scope
//        var myOtherAside = $aside({scope: $scope, template: 'partials/sites_aside_template.html'});
//        // Show when some event occurs (use $promise property to ensure the template has been loaded)
//        myOtherAside.$promise.then(function() {
//            myOtherAside.show();
//        })
    }

        var load = function () {
            vm.loading = true;
            Api.user_sites_and_tasks()
                .then(function (res) {
                    console.log('sites are reseived');
                    vm.sites = res.data;
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
                    vm.site_params = res.data.site_params[0];
                        
                    vm.params = res.data.paramsDiagram;
                    vm.params1 = res.data.paramsTable;
                    vm.site.position = res.data.paramsPosition;
                    
                    vm.chart = null;
                    vm.values = null;
                    vm.chart1 = null;
                    vm.values1 = null;
                    vm.loading = false;
                    vm.options = {
                        chart: {
                            type: 'lineChart',
                            height: 450,
                            width: 590,
                            useInteractiveGuideline: true,
                            x: function(d){ return d[0]; },
                            y: function(d){ return d[1]; },
                            xAxis: {
                                axisLabel: 'Место в выдаче'
                            },
                            yAxis: {
                                axisLabel: 'Значение параметра',
                                tickFormat: function(d){
                                    return d3.format('.02f')(d);
                                },
                                axisLabelDistance: 30
                            }
                        }
                    }
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
                vm.params = null;
                vm.params1 = null;
            } else {
                vm.site = null
                vm.params = null;
                vm.params1 = null;
            }

        };

    }
angular.module('seoControllers').controller('SitesCtrl', SitesCtrl);
