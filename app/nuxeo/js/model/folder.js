angular.module('ngNuxeoClient')

  .factory('Folder', ['Document',
    function (Document) {

      function Folder(folder) {

        // Extend object
        angular.extend(this, folder ? angular.extend(folder, {type: 'Folder'}) : {type: 'Folder'});
      }

      // Inherit
      Folder.prototype = new Document();
      delete Folder.prototype.upload;
      Folder.prototype.constructor = Folder;
      Folder.prototype.defaultPath = '/default-domain/workspaces';

      // Static methods
      angular.extend(Folder, Document);

      return Folder;
    }]);