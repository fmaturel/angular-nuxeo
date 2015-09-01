angular.module('ngNuxeoClient')

  .factory('Workspace', ['Folder',
    function (Folder) {

      function Workspace(folder) {
        // Extend object
        var base = {path : Workspace.defaultPath, type: 'Workspace'};
        angular.extend(this, folder ? angular.extend(folder, base) : base);
      }

      // Inherit
      Workspace.prototype = new Folder();
      Workspace.prototype.constructor = Workspace;
      Workspace.prototype.defaultPath = '/default-domain/workspaces';

      // Static methods
      angular.extend(Workspace, Folder);

      return Workspace;
    }]);