angular.module('ngNuxeoUI')

  .directive('nuxeoNote', [function () {
    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-note.html'
    };
  }]);