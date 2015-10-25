function SitesCtrl($scope, $stateParams, $rootScope, $alert, $aside, $timeout, $q, Api, Authenticate) {


    var vm = this;
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

    vm.options = {
        chart: {
            type: 'lineChart',
//            height: '350',
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
                axisLabelDistance: 30
            }
        }
    }

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
        });
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
}

angular.module('seoControllers').controller('SitesCtrl', SitesCtrl);
