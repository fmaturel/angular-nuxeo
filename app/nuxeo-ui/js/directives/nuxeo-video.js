angular.module('ngNuxeoUI')

  .directive('nuxeoVideo', [function () {
    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-video.html'
    };
  }]);