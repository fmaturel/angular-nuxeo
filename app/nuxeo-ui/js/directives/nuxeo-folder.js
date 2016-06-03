angular.module('ngNuxeoUI')

  .directive('nuxeoFolder', [function () {
    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-folder.html'
    };
  }]);