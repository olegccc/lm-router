# lm-router - simple AngularJS router with real dynamic routing

The idea of this router is to give the ability to have completely dynamic routes without any predefined structure (on the client side). This helps, for example, to build route system which is defined on the server side without the need to expose existing tree to the client, for security or any other purposes. Of course, there can be other usage scenarios as its interface is very generic.

Existing AngularJS routing frameworks require to define the routes on the client side, often without the possibility to override them later.

# Usage example

Suppose we have a server backend which has the following interface: when client asks for any URL the server responds with the following:
- is the url valid: true/false
- error message in case of any error
- template to be displayed
- data to be associated with the template

It can be implemented like this (using Express.js):

    var express = require('express');
    var app = express();
    app.use(express.bodyParser());
    app.post('/router', function(req, res) {
        var url = req.body.url;
        if (url === '/test/something') {
            res.send({
                valid: true,
                template: '<p>{{contents}}</p>',
                data: {
                    contents: 'abc'
                }
            })
        } else {
            res.send({
                error: 'Unknown URL',
                valid: false
            });
        }
    });
    app.listen(80);

Then the client can look like this:

    var app = angular.module('app', ['lm-router']);
    app.controller('main', ['$scope', '$compile', '$http', 'router', function($scope, $compile, $http, router) {
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
                      $scope.body = $compile(response.template)(response.data);
                  } else {
                      $scope.error = response.error;
                      $scope.body = "";
                  }
              });
          });
        router.start();
      }]);
    angular.bootstrap(document, ['app']);
