angular.module('ngNuxeoUI')

  .directive('nuxeoNote', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-note> element
      templateUrl: 'nuxeo-ui/views/nuxeo-note.html',
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