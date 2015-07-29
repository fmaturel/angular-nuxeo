angular.module('ngNuxeoDemoApp', [
  'ng',
  'ngRoute',
  'ngNuxeoUI'
]).

  config(['$routeProvider', function ($routeProvider) {

    $routeProvider
      .when('/demo', {
        templateUrl: 'demo.html',
        controller: 'DemoController'
      })
      .otherwise({redirectTo: '/demo'});
  }]);
