var app = angular.module('app', ['lm-router']);

app.controller('main', ['$scope', '$parse', '$http', 'router', function($scope, $parse, $http, router) {

    $scope.error = null;
    $scope.body = "<span>Start page</span>";

    $scope.click = function() {
        router.navigate('/test/something');
    };

    router.on('(.*)', function(url) {

        console.log('Our URL: ' + url);

        $http.post('/router', {
            url: url
        }).success(function(response) {
            if (response.valid) {
                $scope.error = null;
                $scope.body = $parse(response.template)(response.data);
            } else {
                $scope.error = response.error;
                $scope.body = "";
            }
        });
    });

    router.start();

}]);

angular.bootstrap(document, ['app']);
