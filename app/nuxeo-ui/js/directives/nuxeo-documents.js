angular.module('ngNuxeoUI')

  .directive('nuxeoDocuments', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-documents> element
      templateUrl: 'nuxeo-ui/views/nuxeo-documents.html',
      scope: {
        documents: '=',
        publishPath: '=',
        onSuccess: '&',
        onError: '&'
      },
      controller: ['$scope', 'Section', function ($scope, Section) {
        $scope.documents = {pageIndex: 0};

        $scope.publishPath = Section.prototype.defaultPath;
      }]
    };
  }]);