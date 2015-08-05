angular.module('ngNuxeoUI')

  .directive('nuxeoDocument', ['$http', function () {

    return {
      restrict: 'E',
      require: '^nuxeoDocuments',
      replace: true, // replaces the <nuxeo-document> element
      templateUrl: 'template/nuxeo/nuxeo-document.html'
    };
  }]);

angular.module('template/nuxeo/nuxeo-document.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-document.html',
    '<div class="thumbnail" >' +
    '  <a href="javascript:void(0)">' +
    '    <div class="media">' +
    '      <nuxeo-picture ng-if="entry.type === \'Picture\'"></nuxeo-picture>' +
    '      <nuxeo-audio ng-if="entry.type === \'Audio\'"></nuxeo-audio>' +
    '      <nuxeo-video ng-if="entry.type === \'Video\'"></nuxeo-video>' +
    '      <nuxeo-note ng-if="entry.type === \'Note\'"></nuxeo-note>' +
    '      <nuxeo-file ng-if="entry.type === \'File\'"></nuxeo-file>' +
    '    </div>' +
    '    <div class="caption">' +
    '      <span>{{entry.title | limitTo:25}}</span>' +
    '    </div>' +
    '  </a>' +
    '  <div class="action">' +
    '    <a href="{{entry.srcURL || \'javascript:void(0)\'}}">' +
    '      <span class="glyphicon glyphicon-download-alt"></span>' +
    '    </a>' +
    '    <a href="javascript:void(0)" ng-show="entry.isDeletable" ng-click="fn.delete($index)">' +
    '      <span class="glyphicon glyphicon-trash"></span>' +
    '    </a>' +
    '  </div>' +
    '</div>');
}]);


