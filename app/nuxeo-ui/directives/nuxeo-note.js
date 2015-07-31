angular.module('ngNuxeoUI')

  .directive('nuxeoNote', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-note> element
      templateUrl: 'template/nuxeo/nuxeo-note.html',
      controller: ['$scope', function ($scope) {
        var ctx = $scope.entry.contextParameters;
        if (ctx && ctx.thumbnail && ctx.thumbnail.url) {
          $scope.thumbnailURL = ctx.thumbnail.url;
        }

        var fileProps = $scope.entry.properties['file:content'];
        $scope.srcURL = fileProps && fileProps.data;
      }]
    };
  }]);

angular.module('template/nuxeo/nuxeo-note.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-note.html',
    '<div ng-if="entry.type === \'Note\'">' +
    '  <img alt="note" ng-src="/images/notes.png">' +
    '</div>');
}]);