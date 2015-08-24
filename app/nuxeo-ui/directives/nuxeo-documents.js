angular.module('ngNuxeoUI')

  .directive('nuxeoDocuments', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-documents> element
      templateUrl: 'template/nuxeo/nuxeo-documents.html',
      controller: ['$scope', function ($scope) {
        $scope.documents = {pageIndex: 0};
      }]
    };
  }]);

angular.module('template/nuxeo/nuxeo-documents.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-documents.html',
    '<ul class="nuxeo-docs">' +
    '  <li ng-repeat="entry in documents.entries"><nuxeo-document></nuxeo-document></li>' +
    '</ul>');
}]);

