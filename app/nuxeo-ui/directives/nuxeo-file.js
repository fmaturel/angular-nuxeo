angular.module('ngNuxeoUI')

  .directive('nuxeoFile', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-file> element
      templateUrl: 'template/nuxeo/nuxeo-file.html'
    };
  }]);

angular.module('template/nuxeo/nuxeo-file.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-file.html',
    '<div ng-if="entry.type === \'File\'">' +
    '  <img alt="file" ng-src="{{thumbnailURL}}">' +
    '</div>');
}]);