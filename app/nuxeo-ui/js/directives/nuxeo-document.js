angular.module('ngNuxeoUI')

  .directive('nuxeoDocument', ['$http', function () {

    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-document> element
      templateUrl: 'nuxeo-ui/views/nuxeo-document.html',
      scope: {
        entry: '=',
        deletable: '@',
        publishTo: '@',
        onSuccess: '&',
        onError: '&'
      },
      link: function (scope, element, attr) {
        if (attr.deletable === 'true') {
          scope.entry.isDeletable = true;
        }

        var publishPath = attr.publishTo;
        if (publishPath) {
          if (angular.isString(publishPath)) {
            scope.publishPath = publishPath;
          }
        }
      }
    };
  }]);