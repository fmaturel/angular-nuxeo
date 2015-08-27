angular.module('ngNuxeoUI')

  .directive('nuxeoDocuments', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-documents> element
      templateUrl: 'nuxeo-ui/views/nuxeo-documents.html',
      controller: ['$scope', function ($scope) {
        $scope.documents = {pageIndex: 0};
      }]
    };
  }]);