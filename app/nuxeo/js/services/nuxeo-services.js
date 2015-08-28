angular.module('ngNuxeoClient')

  .service('nuxeo', ['Document', 'Section', 'NuxeoQuery', 'NuxeoDirectory', 'NuxeoTag',
    function (Document, Section, NuxeoQuery, NuxeoDirectory, NuxeoTag) {

      this.Document = Document;

      this.Section = Section;

      this.Query = NuxeoQuery;

      this.continents = NuxeoDirectory.continents;

      this.countries = NuxeoDirectory.countries;

      this.natures = NuxeoDirectory.natures;

      this.subjects = NuxeoDirectory.subjects;

      this.tags = NuxeoTag;
    }]);