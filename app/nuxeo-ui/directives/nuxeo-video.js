angular.module('ngNuxeoUI')

  .directive('nuxeoVideo', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-video> element
      templateUrl: 'template/nuxeo/nuxeo-video.html'
    };
  }]);

angular.module('template/nuxeo/nuxeo-video.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-video.html',
    '<video ng-if="entry.type === \'Video\'" controls preload="none" ng-attr-poster="{{entry.thumbnailURL}}">' +
    '  <source ng-src="{{entry.srcURL}}">' +
    '</video>');
}]);