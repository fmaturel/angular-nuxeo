angular.module('ngNuxeoClient')

  .factory('Folder', ['Document', 'nuxeoUtils',
    function (Document, utils) {

      var Folder = utils.inherit(function Folder(folder) {
        // Call Parent function with argument
        Document.call(this, folder);
      }, Document);

      // Media type
      Folder.prototype.type = 'Folder';

      return Folder;
    }]);