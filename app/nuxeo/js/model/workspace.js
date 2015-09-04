angular.module('ngNuxeoClient')

  .factory('Workspace', ['Folder', 'nuxeoUtils',
    function (Folder, utils) {

      var Workspace = utils.inherit(function Workspace(workspace) {
        // Default behaviour if no argument supplied
        angular.extend(this, {type: 'Workspace'});

        // Call Parent function with argument
        if (workspace) {
          Folder.call(this, workspace);
        }
      }, Folder);

      return Workspace;
    }]);