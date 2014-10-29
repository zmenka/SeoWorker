'use strict';
var seoDirectives = angular.module('seoDirectives', []);

seoDirectives.directive('paramsPopover', function(){
    return {
        restrict: 'A',
        template: '<span>Label</span>',
        link: function (scope, el, attrs) {
        console.log("Popover Directive Loaded");
    }
};
});
