angular.module('ngNuxeoUI')

  .directive('nuxeoSelect', ['nuxeo', function (nuxeo) {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-select> element
      templateUrl: 'nuxeo-ui/views/nuxeo-select.html',
      scope: {
        directory: '@',
        property: '@',
        model: '='
      },
      link: function postLink(scope) {
        nuxeo[scope.directory].get(function (data) {
          scope.items = data.entries;
        });
      }
    };
  }]);