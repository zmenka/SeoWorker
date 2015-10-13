function RatingCtrl($scope) {
    var data = [
        { domen: "google.com", page: "google.com/search"},
        { domen: "yandex.ru", page: "yandex.ru/search"}
    ];

    $scope.gridOptions = {
        rowHeight: 100
    };
    $scope.gridOptions.columnDefs = [
        {   field:'domen'   },
        {   field:'page'    },
        {
            field: 'spark',
            displayName: 'График',
            cellTemplate: '<div class="ui-grid-cell-contents">' +
                            '<nvd3 options="row.entity.spark.options" data="row.entity.spark.data"></nvd3>' +
                            '</div>'
        }
    ];
    data.forEach(function (d) {
        d.spark = {
            options: {
                chart: {
                    type: 'lineChart',
                    height:100,
                    showLegend: false,
                    lines: {interactive : false},
                    yAxis: {
                        tickFormat: function(d){
                            return d3.format('.02f')(d);
                        },
                    },
                    x: function (xd) {
                        return xd.x;
                    },
                    y: function (xd) {
                        return xd.y;
                    }
                }
            },
            data: sinAndCos()
        };
    });

    $scope.gridOptions.data = data;

    function sinAndCos() {
        var sin = [],sin2 = [];

        //Data is represented as an array of {x,y} pairs.
        for (var i = 0; i < 100; i++) {
            sin.push({x: i, y: Math.sin(i/10)});
            sin2.push({x: i, y: i % 10 == 5 ? null : Math.sin(i/10) *0.25 + 0.5});
        }

        //Line chart data should be sent as an array of series objects.
        return [
            {
                values: sin,      //values - represents the array of {x,y} data points
                key: 'Sine Wave', //key  - the name of the series.
                color: '#ff7f0e'  //color - optional: choose your own line color.
            },
            {
                values: sin2,
                key: 'Another sine wave',
                color: '#7777ff'
            }
        ];
    };
}

angular.module('seoControllers').controller('RatingCtrl', RatingCtrl);
