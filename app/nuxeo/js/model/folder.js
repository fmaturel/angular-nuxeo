angular.module('ngNuxeoClient')

  .factory('Folder', ['Document', 'nuxeoUtils',
    function (Document, utils) {

      var Folder = utils.inherit(function Folder(folder) {
        // Default behaviour if no argument supplied
        angular.extend(this, {type: 'Folder'});

        // Call Parent function with argument
        if (folder) {
          Document.call(this, folder);
        }
      }, Document);

      return Folder;
    }]);