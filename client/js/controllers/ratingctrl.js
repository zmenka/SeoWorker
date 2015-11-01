function RatingCtrl($scope, $stateParams, $alert, CondurlApi, Api, $interval) {
    /*
    * -----------------------------------------
    * Настройка графика с позициями и процентами
    * -----------------------------------------
    * */
    var sparkConfig = {
            chart: {
                type: 'multiChart',
                noData: 'Данные не получены',
                margin: {
                    top: 30,
                    right: 80,
                    bottom: 50,
                    left: 70
                },
                x: function (xd) {
                    return new Date(xd.x);
                },
                y: function (xd) {
                    return Math.round(xd.y);
                },
                tooltip: {
                    contentGenerator: function(data){
                        var key = data.series[0].key,
                            x =  d3.time.format('%d/%m/%Y')(data.point.x),
                            y = key === 'Продвинутость' ? data.point.y + ' %'
                                : data.point.y + ' место';
                        return '<h3>' + x + '</h3>' +
                            '<p>' + key + ': ' + y + '</p>';
                    }
                },
                xAxis: {
                    tickFormat: function(d){
                        console.log(d);
                        return  d3.time.format('%d/%m/%Y')(new Date(d));
                    }
                },
                yAxis1: {
                    rotateYLabel: true,
                    axisLabelDistance: -10,
                    axisLabel: 'Продвинутость(%)',
                    tickFormat: function(d){
                        return Math.round(d);
                    }
                },
                yAxis2: {
                    tickFormat: function(d){
                        return Math.round(d);
                    },
                    axisLabel: 'Место в выдаче',
                    rotateYLabel: true
                },
                yDomain2: [50, 1],
                yDomain1: [0, 100]
            },
            styles: {
                classes: {
                    rating: true
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

    /*
    *-----------------------------------------
    * Настройка таблицы с сайтами
    *-----------------------------------------
    */
    $scope.gridOptions = {
        rowHeight: 200,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 0
    };
    $scope.gridOptions.columnDefs = [
        {   field:'domen', displayName: 'Домен', width:  150},
        {   field:'page', displayName: 'Страница', width:  150 },
        {
            field: 'spark',
            displayName: 'График',
            cellTemplate: '<div class="ui-grid-cell-contents">' +
            '<nvd3 options="row.entity.spark.options" data="row.entity.spark.data" api="grid.appScope.api"></nvd3>'
        },
        {
            field: 'btnControl',
            displayName: '',
            cellTemplate: '<div class="ui-grid-cell-contents">' +
                '<button type="button" class="btn btn-primary" ng-disabled="row.entity.spark.data.length" ' +
                'ng-click="grid.appScope.getSpark(row.entity.curl_id)">'+
                'Показать график'+
                '</button>'+
            '</div>'
        }
    ];

    // Формат данных: {domen: 'google.com', page: 'google.com/eee', spark: {option: {}, data: []}}
    $scope.gridOptions.data = [];

    /*
    * -----------------------------------------
    * Получение списка сайтов по user_id
    * -----------------------------------------
    * */
    (function(){
        return Api.user_sites_and_tasks($stateParams.user_id, false)
            .then(function(res){

                // Вызываем событие 'loadCondurlId' при успешной загрузке
                $scope.$broadcast('loadCondurlId', res.data);
                console.log('load Api.user_sites_and_tasks res', res);
                return res;
            })
            .catch(function (err) {
                console.log('load Api.user_sites_and_tasks err ', err);
                $alert({
                    title: 'Внимание!', content: "Ошибка при получении списка сайтов"
                    + (err.data ? ": " + err.data : "!"),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: 'body'
                });
            });
    })();

    //Прослушиваем событие 'loadCondurlId' (данные с сервера получены)
    $scope.$on('loadCondurlId', function(event, data){
        $scope.gridOptions.data = buildTable(event, data);
    });

    //Прослушиваем событие 'loadSpark' (данные с процентами/позициями получены)
    $scope.$on('loadSpark', function(event, data){
        $scope.gridOptions.data.forEach(function(el, num, arr){
            if(el.curl_id == data.id) {
                buildSpark(event, data) ? arr[num].spark.data.push(buildSpark(event, data)) : null;
            }
        });
        $scope.api.update();
    });

    function buildTable(e, data) {
        var res = [];
        data.forEach(function(domen){
            domen.nodes.forEach(function(page){
                page.nodes.forEach(function(req){
                    res.push({
                        domen: domen.title,
                        page: page.title,
                        query: req.data.condition_query,
                        curl_id: req.data.condurl_id,
                        spark: {
                            options: sparkConfig,
                            data: []
                        }
                    });
                })
            })
        });
        return res;
    }

    function buildSpark(e, values){
        var res = {
            values: [],
            key: '',
            color: '#ff7f0e',
            type: 'line',
            yAxis: undefined
        };
        if(values.flag == 'position' && values.data.length) {
            res.key = 'Место в выдаче';
            res.yAxis = 2;
            res.color = '#000000';
            res.values = values.data.map(function(obj) {
                return {x: obj.date_create, y: obj.position_n};
            });
            return res;
        }
        if(values.flag == 'percent' && values.data.length) {
            res.key = 'Позиция';
            res.yAxis = 1;
            res.values = values.data.map(function(obj) {
                return {x: obj.date_create, y: obj.percent};
            });
            return res;
        }
    }

    $scope.getSpark = function (condurl_id) {
        getPosition(condurl_id);
        getPercent(condurl_id);
    }
}

angular.module('seoControllers').controller('RatingCtrl', RatingCtrl);
