function SitesCtrl($scope, $stateParams, $rootScope, $alert, $aside, $timeout, $q, Api, Authenticate, CondurlApi) {


    var vm = this,
        sparkConfig = {
            chart: {
                type: 'multiChart',
                noData: 'Подождите, идет загрузка графика',
                margin: {
                    top: 30,
                    right: 80,
                    bottom: 50,
                    left: 70
                },
                x: function (xd) {
                    var date = new Date(xd.x);
                    return date.getTime();
                },
                y: function (xd) {
                    return Math.round(xd.y);
                },
                tooltip: {
                    contentGenerator: function(data){
                        var key = data.series[0].key,
                            x =  d3.time.format('%d/%m/%Y')(new Date(data.point.x)),
                            y = key === 'Продвинутость' ? data.point.y + ' %'
                                : data.point.y + ' место';
                        return '<h3>' + x + '</h3>' +
                            '<p>' + key + ': ' + y + '</p>';
                    }
                },
                xAxis: {
                    tickValues: function(charts){
                        var ticks = [];
                        charts.forEach(function(chart){
                            chart.values.forEach(function(value){
                                ticks.push((new Date(value.x)).getTime());
                            });
                        });
                        return ticks;
                    },
                    tickFormat: function(x){
                        return  d3.time.format('%d/%m/%Y')(new Date(x));
                    }
                },
                yAxis1: {
                    tickValues: function(charts) {
                        var ticks = [];
                        ticks.push(100,80,60,40,20,0);
                        return ticks;
                    },
                    rotateYLabel: true,
                    axisLabelDistance: -10,
                    axisLabel: 'Продвинутость(%)'
                },
                yAxis2: {
                    tickValues: function(charts) {
                        var ticks = [];
                        ticks.push(1,10,20,30,40,50);
                        return ticks;
                    },
                    tickFormat: function(d){
                        return Math.round(d);
                    },
                    axisLabel: 'Место в выдаче',
                    rotateYLabel: true
                },
                yDomain2: [50, 1],
                yDomain1: [0, 100]
            }
        },
        standartChartConfig = {
            chart: {
                type: 'lineChart',
                noData: '',
                x: function (d) {
                    return d[0];
                },
                y: function (d) {
                    return d[1];
                },
                xAxis: {
                    axisLabel: 'Место в выдаче'
                },
                yAxis: {
                    axisLabel: 'Значение параметра',
                    tickFormat: function (d) {
                        return d3.format('.02f')(d);
                    },
                    showMax: true,
                    tickValues: function(charts){
                        var ticks = [],
                            middleArr = []; // Вспомогательный массив
                        // для нахождения середины коридора

                        charts.forEach(function(chart){
                            if(chart.key && chart.key === 'Граница коридора'){
                                chart.values.forEach(function(xy){
                                    if(!parseInt(xy[0], 10)) {
                                        ticks.push(xy[1]);
                                        middleArr.push(parseFloat(xy[1]));
                                    }
                                });
                                ticks.push((middleArr[0]+middleArr[1])/2);
                            } else if(chart.key === 'Ваш сайт') {
                                ticks.push(chart.values[0][1]);
                            }
                        });
                        return ticks;
                    }

                }
            }
        },
        getPosition = function(condurl_id){
            return CondurlApi.get_all_positions(condurl_id)
                .then(function(res){

                    // Вызываем событие 'loadSpark' при успешной загрузке
                    $scope.$broadcast('loadSpark', {data: res.data, flag: 'position', id: condurl_id});
                    console.log('load CondurlApi.get_all_positions res', condurl_id, res);
                    return res;
                })
                .catch(function (err) {
                    console.log('load CondurlApi.get_all_positions err ', err);
                    $alert({
                        title: 'Внимание!', content: "Ошибка при получении позиций сайтов"
                        + (err.data ? ": " + err.data : "!"),
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: 'body'
                    });
                });
        },
        getPercent = function(condurl_id){
            return CondurlApi.get_all_percents(condurl_id)
                .then(function(res){

                    // Вызываем событие 'loadSpark' при успешной загрузке
                    $scope.$broadcast('loadSpark', {data: res.data, flag: 'percent', id: condurl_id});
                    console.log('load CondurlApi.get_all_percents res', condurl_id, res);
                    return res;
                })
                .catch(function (err) {
                    console.log('load CondurlApi.get_all_percents err ', err);
                    $alert({
                        title: 'Внимание!', content: "Ошибка при получении продвинутости сайтов"
                        + (err.data ? ": " + err.data : "!"),
                        placement: 'top', type: 'danger', show: true,
                        duration: '3',
                        container: 'body'
                    });
                });
        };


    vm.myAside = null;
    vm.showAside = showAside1;
    vm.asideLoading = false;
    vm.loading = false;
    vm.sites = [];
    vm.site = null;
    vm.getParams = getParams;
    vm.getParamtypes = getParamtypes;
    vm.calcParams = calcParams;
    vm.calcSiteParams = calcSiteParams;
    vm.selectParam = selectParam;
    vm.data = {};
    vm.isAdmin = isAdmin;
    vm.reloadSitesAndAside = reloadSitesAndAside;
    vm.startLoadDone = false;

    vm.options = standartChartConfig;

    startLoad()

    function isAdmin() {
        return Authenticate.isAdmin()
    }

    //$scope.$watch('vm.site', function (current, original) {
    //    console.log("clear");
    //});

    function startLoad(){
        return load()
            .then(function(){
                vm.startLoadDone = true
            });
    }


    function showAside1(quite, reInit) {
        if (!quite){
            $rootScope.treeLoading = true;
            vm.asideLoading = true;
        }
        $timeout(function () {
            showAside(reInit);
        }, 100);
    }

    function showAside(reInit) {
        if (reInit){
            console.log('REINIT aside')
            vm.myAside.destroy()
            vm.myAside = null;
        }
        if (vm.myAside) {
            vm.myAside.$promise.then(function () {
                vm.myAside.show();
            })

        } else {
            if (vm.sites && vm.sites.length) {
                //            console.log("NEW");
                var scope = $rootScope.$new();
                scope.sites = vm.sites;
                scope.nodeselect = selectSite;


                $rootScope.$on('onAsideFinishRender', function (ngRepeatFinishedEvent) {
                    $rootScope.treeLoading = false;
                    vm.asideLoading = false;
                    console.log("onAsideFinishRender");

                });
                vm.myAside = $aside({
                    scope: scope, show: (reInit ? false : true),
                    placement: "left", animation: "fade-and-slide-left",
                    template: 'partials/sites_aside_template.html'
                });

            } else if (vm.startLoadDone) {
                vm.asideLoading = false;
                $alert({
                    title: 'Внимание!', content: "У вас пока нет сайтов.",
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            }

        }

    }

    function selectSite(node) {
        console.log("selectSite", node);
        if (node.type == 'task') {
            vm.site = node;
            if (vm.myAside) {
                vm.myAside.hide();
            }
            if (!node.data.types){
                vm.getParamtypes()
                    .then(function () {
                        node.data.types = vm.data.chart
                    });
            } else {
                vm.data.chart = node.data.types;
            }
            vm.asideLoading = false;
        }

    }

    function selectParam(node) {
        console.log("selectParam", node);
        if (node.type == 'key') {
            vm.data.chartParamType = node.data.paramtype_id;
            if (node.data.chart) {
                vm.options = standartChartConfig;
                vm.data.chartValue = node.data.chart
            } else if (vm.site ){
                vm.getParams(vm.site.data.url_id, vm.site.data.condition_id, vm.data.chartParamType)
                    .then(function () {
                        node.data.chart = vm.data.chartValue
                    })
            }

        }

    }

    function load(quite, reInitAside) {
        if (!quite){
            vm.loading = true;
        }
        return Api.user_sites_and_tasks($stateParams.user_id, false)
            .then(function (res) {
                console.log("load Api.user_sites_and_tasks ", res);
                vm.sites = res.data;
                vm.showAside(quite,reInitAside);
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
            })
            .finally(function(){
                if (!quite) {
                    vm.loading = false;
                }
            });
    };

    function reloadSitesAndAside(){
        return load(true, true)
    }

    function getParamtypes() {
        if (!vm.site) {
            return $q(undefined);
        }
        vm.loading = true;

        return Api.get_paramtypes(vm.site.data.condition_id, vm.site.data.url_id)
            .then(function (res) {
                console.log("get_paramtypes Api.get_paramtypes", res);

//                vm.site_params = res.data.site_params[0];
                vm.data.chart = res.data
                vm.loading = false;
                //return res.data
            })
            .catch(function (err) {
                console.log('get_paramtypes Api.get_paramtypes err ', err);
                vm.loading = false;
                vm.data.chart = null;

                $alert({
                    title: 'Внимание!', content: "Параметры не получены " + (err.data ? ": " + err.data : "!"),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            })
    }

    function getParams(url_id, condition_id, type_param) {

        vm.loading = true;
        return Api.get_params(url_id, condition_id, type_param)
            .then(function (res) {
                console.log("getParams Api.get_params", res);

                vm.loading = false;
                //return res.data;
                vm.options = standartChartConfig;
                vm.data.chartValue = res.data;
            })
            .catch(function (err) {
                console.log('getParams Api.get_params err ', err);
                vm.loading = false;
                vm.data.chartValue = null;
                $alert({
                    title: 'Внимание!', content: "Параметры не получены " + (err.data ? ": " + err.data : "!"),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            })
    }


    function calcParams() {
        if (!vm.site) {
            return;
        }
        vm.loading = true;

        vm.data = {};
        return Api.calc_params(vm.site.data.condition_id)
            .then(function () {
                vm.reloadSitesAndAside();
                return vm.getParamtypes()
            })
            .catch(function (err) {
                console.log('calcParams Api.calc_params err ', err);
                vm.loading = false;

                $alert({
                    title: 'Внимание!', content: "Параметры не пересчитаны.  " + (err.data ? ": " + err.data : "!"),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            })

            .finally(function () {
                vm.loading = false;
            })
    }

    function calcSiteParams() {
        if (!vm.site) {
            return;
        }
        vm.loading = true;

        return Api.calc_site_params(vm.site.data.condition_id, vm.site.data.url_id )
            .then(function (res) {
                console.log("calcSiteParams Api.calc_site_params err", res);
                vm.loading = false;
                vm.reloadSitesAndAside();
                return vm.getParamtypes()
            })
            .catch(function (err) {
                console.log("calcSiteParams Api.calc_site_params ", err)
                $alert({
                    title: 'Внимание!', content: "Параметры страницы не получены "
                    + (err.data ? ": " + err.data : "!"),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            })

    }

    function buildSpark(e, values){
        var res = {
            values: [],
            key: '',
            color: '#ff7f0e',
            type: 'line',
            yAxis: undefined
        },
        numberorder = function (a, b) {
            return a.x - b.x;
        };
        if(values.flag == 'position' && values.data.length) {
            res.key = 'Место в выдаче';
            res.yAxis = 2;
            res.color = '#1F77B4';
            res.values = values.data.map(function(obj) {
                return {x: (new Date(obj.date_create)).getTime(), y: obj.position_n+0};
            });
            res.values.sort(numberorder);
            return res;
        }
        if(values.flag == 'percent' && values.data.length) {
            res.key = 'Продвинутость';
            res.yAxis = 1;
            res.values = values.data.map(function(obj) {
                return {x: (new Date(obj.date_create)).getTime(), y: obj.percent+0};
            });
            res.values.sort(numberorder);
            return res;
        }
    }

    $scope.getSpark = function () {
        vm.options = sparkConfig;
        vm.data.chartValue =[];
        getPosition(vm.site.data.condurl_id);
        getPercent(vm.site.data.condurl_id);
    };

    $scope.$on('loadSpark', function(event, data){
        var newChart = buildSpark(event, data);
        newChart ? vm.data.chartValue.push(newChart): null;
        vm.chartApi.update();
    });
}

angular.module('seoControllers').controller('SitesCtrl', SitesCtrl);
