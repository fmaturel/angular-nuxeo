angular.module('ngNuxeoUI')

  .directive('nuxeoAudio', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-audio> element
      templateUrl: 'nuxeo-ui/views/nuxeo-audio.html'
    };
  }]);