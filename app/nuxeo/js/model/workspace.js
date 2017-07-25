angular.module('ngNuxeoClient')

  .factory('Workspace', ['Folder', 'nuxeoUtils',
    function (Folder, utils) {

      var Workspace = utils.inherit(function Workspace(workspace) {
        // Call Parent function with argument
        Folder.call(this, workspace);
      }, Folder);

      return Workspace;
    }]);