angular.module('ngNuxeoUI')

  .directive('nuxeoPicture', ['nuxeoConstants', function (cst) {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-picture> element
      templateUrl: 'template/nuxeo/nuxeo-picture.html',
      link: function (scope, element, attrs) {
        if(attrs.size === 'large') {
          scope.thumbnailURL = cst.nuxeo.baseURL + '/nxbigfile/default/' + scope.entry.uid + '/picture:views/2/content/Medium_Photos.jpg';
        }
      }
    };
  }]);

angular.module('template/nuxeo/nuxeo-picture.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-picture.html', '<img alt="{{entry.title}}" ng-src="{{entry.thumbnailURL}}">');
}]);