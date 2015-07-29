angular.module('ngNuxeoUI')

  .directive('nuxeoAudio', [function () {
    return {
      restrict: 'E',
      require: '^nuxeoDocument',
      replace: true, // replaces the <nuxeo-audio> element
      templateUrl: 'template/nuxeo/nuxeo-audio.html'
    };
  }]);

angular.module('template/nuxeo/nuxeo-audio.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-audio.html',
    '<div ng-if="entry.type === \'Audio\'">' +
    '  <img alt="audio" ng-src="{{thumbnailURL}}">' +
    '  <audio controls preload="none">' +
    '    <source ng-src="{{srcURL}}">' +
    '  </audio>' +
    '</div>');
}]);