angular.module('ngNuxeoUI')

  .directive('nuxeoDocument', ['nuxeo', function (nuxeo) {

    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-document.html',
      scope: {
        entry: '=',
        uid: '@',
        deletable: '@',
        publishTo: '@',
        onSuccess: '&',
        onError: '&'
      },
      link: function (scope, element, attr) {
        if (!attr.entry) {
          if (attr.uid) {
            nuxeo.Document.query()
              // Basic search
              .withParentIn(attr.uid)
              // Get data
              .$get(function (data) {
                scope.entry = data.entries.length && data.entries[0];
              });
          } else {
            throw 'There should be either an entry or id in nuxeo document directive';
          }
        }

        if (attr.deletable === 'true') {
          scope.entry.isDeletable = true;
        } else if (attr.deletable === 'false'){
          scope.entry.isDeletable = false;
        }

        var publishPath = attr.publishPath;
        if (publishPath) {
          if (angular.isString(publishPath)) {
            scope.publishPath = publishPath;
          }
        }
      }
    };
  }]);