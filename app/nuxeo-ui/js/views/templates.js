angular.module('ngNuxeoUITemplates', ['nuxeo-ui/views/nuxeo-audio.html', 'nuxeo-ui/views/nuxeo-document.html', 'nuxeo-ui/views/nuxeo-documents.html', 'nuxeo-ui/views/nuxeo-file.html', 'nuxeo-ui/views/nuxeo-note.html', 'nuxeo-ui/views/nuxeo-picture.html', 'nuxeo-ui/views/nuxeo-select.html', 'nuxeo-ui/views/nuxeo-video.html']);

angular.module('nuxeo-ui/views/nuxeo-audio.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-audio.html',
    '<div ng-if="entry.type === \'Audio\'">\n' +
    '  <img alt="audio" ng-src="{{entry.thumbnailURL}}">\n' +
    '  <audio controls preload="none">\n' +
    '    <source ng-src="{{entry.srcURL}}">\n' +
    '  </audio>\n' +
    '</div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-document.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-document.html',
    '<div class="thumbnail">\n' +
    '  <a href="javascript:void(0)">\n' +
    '    <div class="media">\n' +
    '      <nuxeo-picture ng-if="entry.type === \'Picture\'"></nuxeo-picture>\n' +
    '      <nuxeo-audio ng-if="entry.type === \'Audio\'"></nuxeo-audio>\n' +
    '      <nuxeo-video ng-if="entry.type === \'Video\'"></nuxeo-video>\n' +
    '      <nuxeo-note ng-if="entry.type === \'Note\'"></nuxeo-note>\n' +
    '      <nuxeo-file ng-if="entry.type === \'File\'"></nuxeo-file>\n' +
    '    </div>\n' +
    '    <div class="caption">\n' +
    '      <span>{{entry.title | limitTo:25}}</span>\n' +
    '    </div>\n' +
    '  </a>\n' +
    '\n' +
    '  <div class="action">\n' +
    '    <a href="{{entry.srcURL || \'javascript:void(0)\'}}">\n' +
    '      <span class="glyphicon glyphicon-download-alt"></span>\n' +
    '    </a>\n' +
    '    <a href="javascript:void(0)" ng-show="entry.isDeletable" ng-click="fn.delete($index)">\n' +
    '      <span class="glyphicon glyphicon-trash"></span>\n' +
    '    </a>\n' +
    '  </div>\n' +
    '</div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-documents.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-documents.html',
    '<ul class="nuxeo-docs">\n' +
    '  <li ng-repeat="entry in documents.entries">\n' +
    '    <nuxeo-document></nuxeo-document>\n' +
    '  </li>\n' +
    '</ul>');
}]);

angular.module('nuxeo-ui/views/nuxeo-file.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-file.html',
    '<div ng-if="entry.type === \'File\'">\n' +
    '  <img alt="file" ng-src="{{entry.thumbnailURL}}">\n' +
    '</div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-note.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-note.html',
    '<div ng-if="entry.type === \'Note\'">\n' +
    '  <img alt="note" ng-src="/images/notes.png">\n' +
    '</div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-picture.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-picture.html',
    '<img alt="{{entry.title}}" ng-src="{{entry.thumbnailURL}}">');
}]);

angular.module('nuxeo-ui/views/nuxeo-select.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-select.html',
    '<select ng-options="item.properties.{{property || \'label\'}} for item in items" ng-model="model">\n' +
    '  <!-- items -->\n' +
    '</select>');
}]);

angular.module('nuxeo-ui/views/nuxeo-video.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-video.html',
    '<video ng-if="entry.type === \'Video\'" controls preload="none" ng-attr-poster="{{entry.thumbnailURL}}">\n' +
    '  <source ng-src="{{entry.srcURL}}">\n' +
    '</video>');
}]);
