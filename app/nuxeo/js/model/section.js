angular.module('ngNuxeoClient')

  .factory('Section', ['Folder', 'nuxeoUtils',
    function (Folder, utils) {

      var Section = utils.inherit(function Section(section) {
        // Default behaviour if no argument supplied
        section = angular.extend({path: Section.prototype.defaultPath, type: 'Section'}, section);

        // Call Parent function with argument
        Folder.call(this, section);
      }, Folder);

      // Inherit
      Section.prototype.defaultPath = '/default-domain/sections';

      return Section;
    }]);