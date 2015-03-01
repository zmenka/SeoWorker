'use strict';
var seoDirectives = angular.module('seoDirectives', []);

seoDirectives.directive('sitesTree', function(){
    return {
        restrict: 'E',
        templateUrl: 'partials/sites_tree_template.html',
        scope: {
            /*
                [
                    {
                       title: String, //имя
                       data: Object, //тут инфа, которая нужна при выборе данного элемента
                       nodes:[{},{}] //вложенные элементы такой же структуры
                    }
                ]
             */
            sites: "=",
            /*
                function(node.data){} // метод обработки выбранных данных
             */
            nodeselect: "="
        }
    };
});
