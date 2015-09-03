angular.module('ngNuxeoClient')

  .service('nuxeo', ['Document', 'Folder', 'Section', 'Workspace', 'NuxeoDirectory', 'NuxeoTag',
    function (Document, Folder, Section, Workspace, NuxeoDirectory, NuxeoTag) {

      this.Document = Document;

      this.Folder = Folder;

      this.Section = Section;

      this.Workspace = Workspace;

      this.continents = NuxeoDirectory.continents;

      this.countries = NuxeoDirectory.countries;

      this.natures = NuxeoDirectory.natures;

      this.subjects = NuxeoDirectory.subjects;

      this.tags = NuxeoTag;
    }]);