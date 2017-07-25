angular.module('ngNuxeoClient')

  .factory('Section', ['Folder', 'nuxeoUtils',
    function (Folder, utils) {

      var Section = utils.inherit(function Section(section) {
        // Call Parent function with argument
        Folder.call(this, section);
      }, Folder);

      // Media Type
      Section.prototype.type = 'Section';

      Section.prototype.defaultPath = '/default-domain/sections';

      return Section;
    }]);