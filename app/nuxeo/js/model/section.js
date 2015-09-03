angular.module('ngNuxeoClient')

  .factory('Section', ['Folder', 'nuxeoUtils',
    function (Folder, utils) {

      var Section = utils.inherit(function Section(section) {
        angular.extend(this, angular.extend({path: Section.prototype.defaultPath, type: 'Section'}, section));
      }, Folder);

      // Inherit
      Section.prototype.defaultPath = '/default-domain/sections';

      return Section;
    }]);