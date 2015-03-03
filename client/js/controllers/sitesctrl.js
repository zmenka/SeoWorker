function SitesCtrl ($scope, $rootScope, $alert, $aside, Api) {
    var vm = this;
    vm.myAside = null;
    vm.showAside = showAside;
    vm.loading = false;
    vm.sites = [];
    vm.site = null;
    vm.getParams = getParams;
    vm.calcSiteParams = calcSiteParams;
    vm.sitesParams = null;
    vm.chart = null;
    vm.chartValue = null;

    vm.options = {
        chart: {
            type: 'lineChart',
//            height: 650,
//            width: 590,
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

    load();


    function showAside(){
        if (vm.myAside){
//            console.log("OLD");
            vm.myAside.show();
        } else{
            if (vm.sites.length){
                //            console.log("NEW");
                var scope = $rootScope.$new();
                scope.sites = vm.sites;
                scope.nodeselect = selectNode;
                vm.myAside = $aside({scope: scope, show: true,
                    placement: "left", animation: "fade-and-slide-left",
                    template: 'partials/sites_aside_template.html'});
            }

        }

    }

    function selectNode(node) {
//        console.log("selectNode", node);
        vm.site = node;
    }

    function load () {
        vm.loading = true;
        Api.user_sites_and_tasks()
            .then(function (res) {
                console.log("load Api.user_sites_and_tasks ", res);
                vm.sites = res.data;
                vm.loading = false;
            })
            .catch(function (err) {
                console.log('load Api.user_sites_and_tasks ', err);
                vm.sites = [];
                vm.loading = false;
                $alert({title: 'Внимание!', content: "Ошибка при получении списка сайтов"
                    + (err.data ? ": " + err.data : "!"),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
            });
    };


    function getParams() {
        if (!vm.site){
            return;
        }
        vm.loading = true;
        return Api.get_params(vm.site.data.url_id, vm.site.data.condition_id)
            .then(function (res) {
                console.log("getParams Api.get_params", res);

//                vm.site_params = res.data.site_params[0];

                vm.chart = res.data.paramsDiagram;
                vm.sitesParams = res.data.paramsTable;
                vm.position = res.data.paramsPosition;

                vm.chartValue = null;
            })
            .catch(function (err) {
                console.log('getParams Api.get_params ', err);

                vm.chart = null;
                vm.sitesParams = null;
                vm.position = null;
                vm.chartValue = null;
                vm.loading = false;

                $alert({title: 'Внимание!', content: "Параметры не получены: " + err.data,
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
            })
    }

    function calcSiteParams() {
        if (!vm.site) {
            return;
        }
        vm.loading = true;

        Api.calc_site_params(vm.site.data.url, vm.site.data.condition_id)
            .catch(function (err) {
                console.log("calcSiteParams Api.calc_site_params ", err)
                $alert({title: 'Внимание!', content: "Параметры страницы не пересчитаны "
                        + (err.data ? ": " + err.data : "!"),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
            })
            .then(function (res) {
                console.log("calcSiteParams Api.calc_site_params", res);
                vm.loading = false;
                vm.getParams();
            })
        }
    }

angular.module('seoControllers').controller('SitesCtrl', SitesCtrl);
