angular.module('ngNuxeoClient')

  .factory('Workspace', ['Folder', 'nuxeoUtils',
    function (Folder, utils) {

      var Workspace = utils.inherit(function Workspace(workspace) {
        angular.extend(this, angular.extend({path: Workspace.prototype.defaultPath, type: 'Workspace'}, workspace));
      }, Folder);

      return Workspace;
    }]);