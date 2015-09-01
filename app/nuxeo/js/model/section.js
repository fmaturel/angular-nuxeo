angular.module('ngNuxeoClient')

  .factory('Section', ['Folder',
    function (Folder) {

      function Section(folder) {
        // Extend object
        var base = {path : Section.defaultPath, type: 'Section'};
        angular.extend(this, folder ? angular.extend(folder, base) : base);
      }

      // Inherit
      Section.prototype = new Folder();
      Section.prototype.constructor = Section;
      Section.prototype.defaultPath = '/default-domain/sections';

      // Static methods
      angular.extend(Section, Folder);

      return Section;
    }]);