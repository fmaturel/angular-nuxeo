angular.module('ngNuxeoClient')

  .factory('Folder', ['Document', 'nuxeoUtils',
    function (Document, utils) {

      var Folder = utils.inherit(function Folder(folder) {
        // Default behaviour if no argument supplied
        folder = angular.extend({type: 'Folder'}, folder);

        // Call Parent function with argument
        Document.call(this, folder);
      }, Document);

      return Folder;
    }]);