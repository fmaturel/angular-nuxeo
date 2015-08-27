angular.module('ngNuxeoUI', [
  'ngNuxeoUITemplates',
  'ngNuxeoClient'
])

  .config(['$compileProvider',
    function ($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript|blob):/);
    }]);