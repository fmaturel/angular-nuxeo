angular.module('ngNuxeoUITemplates', ['nuxeo-ui/views/nuxeo-audio.html', 'nuxeo-ui/views/nuxeo-document.html', 'nuxeo-ui/views/nuxeo-documents.html', 'nuxeo-ui/views/nuxeo-file.html', 'nuxeo-ui/views/nuxeo-note.html', 'nuxeo-ui/views/nuxeo-picture.html', 'nuxeo-ui/views/nuxeo-select.html', 'nuxeo-ui/views/nuxeo-video.html']);

angular.module('nuxeo-ui/views/nuxeo-audio.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-audio.html',
    '<div ng-if="entry.type === \'Audio\'"><img alt=audio ng-src={{entry.thumbnailURL}}><audio controls preload=none><source ng-src={{entry.srcURL}}></source></audio></div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-document.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-document.html',
    '<div class=thumbnail><a href=javascript:void(0)><div class=media ng-class="entry.type | lowercase"><nuxeo-picture ng-if="entry.type === \'Picture\'"></nuxeo-picture><nuxeo-audio ng-if="entry.type === \'Audio\'"></nuxeo-audio><nuxeo-video ng-if="entry.type === \'Video\'"></nuxeo-video><nuxeo-note ng-if="entry.type === \'Note\'"></nuxeo-note><nuxeo-file ng-if="entry.type === \'File\'"></nuxeo-file></div><div class=caption><span>{{entry.title | limitTo:25}}</span></div></a><div class=action><a class=download title=Download ng-href={{entry.srcURL}} ng-if=entry.srcURL><span class="glyphicon glyphicon-download-alt"></span></a> <a class=publish title=Publish href=javascript:void(0) ng-if=entry.isPublishable ng-click="entry.publish({target: publishPath}, onSuccess, onError)"><span class="glyphicon glyphicon-cloud-upload"></span></a> <a class=delete title=Delete href=javascript:void(0) ng-if=entry.isDeletable ng-click="entry.delete(onSuccess, onError)"><span class="glyphicon glyphicon-trash"></span></a></div></div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-documents.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-documents.html',
    '<ul class=nuxeo-docs><li ng-repeat="entry in documents.entries"><nuxeo-document entry=entry publish-path={{publishPath}} on-success=onSuccess() on-error=onError()></nuxeo-document></li></ul>');
}]);

angular.module('nuxeo-ui/views/nuxeo-file.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-file.html',
    '<div ng-if="entry.type === \'File\'"><img alt=file ng-src={{entry.thumbnailURL}}></div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-note.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-note.html',
    '<div ng-if="entry.type === \'Note\'"><svg xmlns=http://www.w3.org/2000/svg version=1.1 x=0 y=0 width=140 height=140 viewbox="0 0 140 140" xml:space=preserve><path d="M20 13.1V4.4c0-2.4 2.2-4.4 5-4.4 2.8 0 5 2 5 4.4v8.7c0 2.4-2.2 4.4-5 4.4-2.7 0-5-2-5-4.4zm120 3.8V131.8c0 4.5-4.5 8.2-10 8.2H10C4.5 140 0 136.3 0 131.8V17C0 12.4 4.5 8.8 10 8.8h5v4.4c0 4.8 4.5 8.7 10 8.7 5.5 0 10-3.9 10-8.7V8.7h70v4.4c0 4.8 4.5 8.7 10 8.7 5.5 0 10-3.9 10-8.7V8.7h5c5.5 0 10 3.7 10 8.2zM130 35H10v96.2l120 0V35zM115 17.5c2.8 0 5-2 5-4.4V4.4C120 2 117.8 0 115 0c-2.8 0-5 2-5 4.4v8.7c0 2.4 2.2 4.4 5 4.4zM25 61.3h90c2.8 0 5-2 5-4.4 0-2.4-2.2-4.4-5-4.4H25c-2.8 0-5 2-5 4.4 0 2.4 2.3 4.4 5 4.4zm0 26.3h90c2.8 0 5-2 5-4.4 0-2.4-2.2-4.4-5-4.4H25c-2.8 0-5 2-5 4.4 0 2.4 2.3 4.4 5 4.4zm0 26.2h90c2.8 0 5-2 5-4.4 0-2.4-2.2-4.4-5-4.4H25c-2.8 0-5 2-5 4.4 0 2.5 2.3 4.4 5 4.4z" style="fill-opacity:0.8;fill:#104564"></svg></div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-picture.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-picture.html',
    '<img alt={{entry.title}} ng-src="{{thumbnailURL || entry.thumbnailURL}}">');
}]);

angular.module('nuxeo-ui/views/nuxeo-select.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-select.html',
    '<select title={{directory}} ng-options="option as option.properties.id for option in options | orderBy:\'properties.id\'"></select>');
}]);

angular.module('nuxeo-ui/views/nuxeo-video.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-video.html',
    '<video ng-if="entry.type === \'Video\'" controls preload=none ng-attr-poster={{entry.thumbnailURL}}><source ng-src={{entry.srcURL}}></source></video>');
}]);
