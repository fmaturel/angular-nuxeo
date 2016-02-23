angular.module('ngNuxeoUI')

  .directive('nuxeoSelect', ['nuxeo', function (nuxeo) {

    return {
      restrict: 'EA',
      replace: true, // replaces the <nuxeo-select> element
      templateUrl: 'nuxeo-ui/views/nuxeo-select.html',
      scope: {
        directory: '@'
      },
      controller: ['$scope', function ($scope) {
        nuxeo[$scope.directory].get(function (data) {
          $scope.options = [{properties: {id: '-- all --', noFilter: true}}];
          $scope.options = $scope.options.concat(data.entries);
        });
      }]
    };
  }]);