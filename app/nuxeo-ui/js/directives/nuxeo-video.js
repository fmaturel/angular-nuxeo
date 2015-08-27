angular.module('ngNuxeoUI')

  .directive('nuxeoVideo', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-video> element
      templateUrl: 'nuxeo-ui/views/nuxeo-video.html'
    };
  }]);