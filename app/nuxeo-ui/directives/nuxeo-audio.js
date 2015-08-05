angular.module('ngNuxeoUI')

  .directive('nuxeoAudio', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-audio> element
      templateUrl: 'template/nuxeo/nuxeo-audio.html'
    };
  }]);

angular.module('template/nuxeo/nuxeo-audio.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-audio.html',
    '<div ng-if="entry.type === \'Audio\'">' +
    '  <img alt="audio" ng-src="{{entry.thumbnailURL}}">' +
    '  <audio controls preload="none">' +
    '    <source ng-src="{{entry.srcURL}}">' +
    '  </audio>' +
    '</div>');
}]);