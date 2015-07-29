angular.module('ngNuxeoUI')

  .directive('nuxeoPicture', [function () {
    return {
      restrict: 'E',
      require: '^nuxeoDocument',
      replace: true, // replaces the <nuxeo-picture> element
      templateUrl: 'template/nuxeo/nuxeo-picture.html'
    };
  }]);

angular.module('template/nuxeo/nuxeo-picture.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-picture.html', '<img alt="{{entry.title}}" ng-src="{{thumbnailURL}}">');
}]);