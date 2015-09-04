angular.module('ngNuxeoClient')

  .factory('Section', ['Folder', 'nuxeoUtils',
    function (Folder, utils) {

      var Section = utils.inherit(function Section(section) {
        // Default behaviour if no argument supplied
        angular.extend(this, {path: Section.prototype.defaultPath, type: 'Section'});

        // Call Parent function with argument
        if(section) {
          Folder.call(this, section);
        }
      }, Folder);

      // Inherit
      Section.prototype.defaultPath = '/default-domain/sections';

      return Section;
    }]);