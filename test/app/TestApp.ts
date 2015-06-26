/// <reference path="../../src/RouterServiceProvider.ts" />

var appModule = angular.module('testApp', ['lm-router']);

appModule.config([
    'routerProvider',
    (routerServiceProvider: RouterServiceProvider) => {
        routerServiceProvider.setRootPath('test');
    }]);

appModule.controller('test', ['$scope', 'router', TestController]);

angular.bootstrap(document, ['testApp']);
