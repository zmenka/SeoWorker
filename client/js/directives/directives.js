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
                       collapsed: Boolean, //свернуть или развернуть элемент
                       nodes:[{},{}], //вложенные элементы такой же структуры
                       type: String //'domen', 'page', 'task'
                    }
                ]
             */
            sites: "=",
            /*
                function(node){} // метод обработки выбранных данных
             */
            nodeselect: "=",
            /*
             function(node){} // метод удалающий выбранных данных
             */
            noderemove: "="
        }
    };
});

seoDirectives.directive('onAsideFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {

                $timeout(function () {
                    scope.$emit('onAsideFinishRender');
                });
            }
        }
    }
});