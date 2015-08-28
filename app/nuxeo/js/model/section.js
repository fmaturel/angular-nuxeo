angular.module('ngNuxeoClient')

  .factory('Section', ['Folder',
    function (Folder) {

      var Section = function (folder) {

        this.type = 'Section';

        Folder.call(this);

        // La classe fille surcharge la classe parente
        Section.prototype = Object.create(Folder.prototype);
        Section.prototype.constructor = Section;
      };

      angular.extend(Section, Folder);

      return Section;
    }]);