angular.module('ngNuxeoUI')

  .directive('nuxeoDocuments', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-documents> element
      templateUrl: 'nuxeo-ui/views/nuxeo-documents.html',
      controller: ['$scope', 'Section', function ($scope, Section) {
        $scope.documents = {pageIndex: 0};

        $scope.publishTo = function () {
          return Section.prototype.defaultPath;
        };
      }],
      link: function postLink(scope, element, attrs) {
        var publishTo = attrs.publishTo;
        if (publishTo) {
          if (angular.isString(scope[publishTo])) {
            scope.publishTo = function () {
              return scope[publishTo];
            };
          }
          if (angular.isFunction(scope[publishTo])) {
            scope.publishTo = scope[publishTo];
          }
        }

        var onSuccess = attrs.onSuccess;
        if (onSuccess && angular.isFunction(scope[onSuccess])) {
          scope.onSuccess = scope[onSuccess];
        }

        var onError = attrs.onError;
        if (onError && angular.isFunction(scope[onError])) {
          scope.onError = scope[onError];
        }
      }
    };
  }]);