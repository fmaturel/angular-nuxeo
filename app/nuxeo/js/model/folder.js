angular.module('ngNuxeoClient')

  .factory('Folder', ['Document', 'nuxeoUtils',
    function (Document, utils) {

      var Folder = utils.inherit(function Folder(folder) {
        angular.extend(this, angular.extend({path: Folder.prototype.defaultPath, type: 'Folder'}, folder));
      }, Document);

      // Inherit
      Folder.prototype.defaultPath = '/default-domain/workspaces';

      // Remove useless methods
      delete Folder.prototype.upload;

      return Folder;
    }]);