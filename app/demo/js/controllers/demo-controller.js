angular.module('ngNuxeoDemoApp')

  .controller('DemoController', ['$scope', 'nuxeoUser',
    function ($scope, nuxeoUser) {

      // ######################################################################### USER SCOPE OBJECT
      $scope.user = nuxeoUser;

    }]);