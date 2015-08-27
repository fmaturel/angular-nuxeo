angular.module('ngNuxeoUI')

  .directive('nuxeoFile', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-file> element
      templateUrl: 'nuxeo-ui/views/nuxeo-file.html'
    };
  }]);