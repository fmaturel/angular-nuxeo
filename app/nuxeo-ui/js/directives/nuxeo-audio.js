angular.module('ngNuxeoUI')

  .directive('nuxeoAudio', [function () {
    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-audio.html'
    };
  }]);