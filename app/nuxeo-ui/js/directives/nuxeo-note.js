angular.module('ngNuxeoUI')

  .directive('nuxeoNote', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-note> element
      templateUrl: 'nuxeo-ui/views/nuxeo-note.html'
    };
  }]);