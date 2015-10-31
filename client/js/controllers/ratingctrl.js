function RatingCtrl($scope, $stateParams, $alert, CondurlApi, Api) {
    /*
    * -----------------------------------------
    * Настройка графика с позициями и процентами
    * -----------------------------------------
    * */
    var sparkConfig = {
            chart: {
                type: 'multiChart',
                margin: {
                    top: 30,
                    right: 80,
                    bottom: 50,
                    left: 70
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
                yDomain1: [0, 100],
                x: function (xd) {
                    return xd.x;
                },
                y: function (xd) {
                    return Math.round(xd.y);
                }
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
                    console.log('load CondurlApi.get_all_positions res', res);
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
                    console.log('load CondurlApi.get_all_percents res', res);
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
        rowHeight: 50,
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
            '<nvd3 options="row.entity.spark.options" data="row.entity.spark.data"></nvd3>' +
            '<button type="button" class="btn btn-primary" ng-show="!row.entity.spark.data.lenght" ' +
                        'ng-click="grid.appScope.getSpark(row.entity.curl_id)">'+
                'Добавить'+
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
                            option: sparkConfig,
                            data: []
                        }
                    });
                })
            })
        });
        //Line chart data should be sent as an array of series objects
        /*
        * {
             values: d1,      //values - represents the array of {x,y} data points
             key: 'Продвинутость', //key  - the name of the series.
             color: '#ff7f0e',  //color - optional: choose your own line color.
             type: 'line',
             yAxis: 1
        }
        * */
        return res;
    }

    $scope.getSpark = function (condurl_id) {
        getPosition(condurl_id);
        getPercent(condurl_id);
    }
}

angular.module('seoControllers').controller('RatingCtrl', RatingCtrl);
