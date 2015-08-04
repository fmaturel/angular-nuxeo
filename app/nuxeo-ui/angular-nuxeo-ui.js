angular.module('ngNuxeoUITemplate', [
    'template/nuxeo/nuxeo-documents.html',
    'template/nuxeo/nuxeo-document.html',
    'template/nuxeo/nuxeo-audio.html',
    'template/nuxeo/nuxeo-picture.html',
    'template/nuxeo/nuxeo-video.html',
    'template/nuxeo/nuxeo-note.html',
    'template/nuxeo/nuxeo-file.html'
  ]
);

angular.module('ngNuxeoUI', [
  'ngNuxeoUITemplate',
  'ngNuxeoClient'
])

  .config(['$compileProvider',
    function ($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript|blob):/);
    }]);