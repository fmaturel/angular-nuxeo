angular.module('ngNuxeoClient')

  .service('nuxeo', ['Document', 'NuxeoQuery', 'NuxeoDirectory', 'NuxeoTag',
    function (Document, NuxeoQuery, NuxeoDirectory, NuxeoTag) {

      this.Document = Document;

      this.Query = NuxeoQuery;

      this.continents = NuxeoDirectory.continents;

      this.countries = NuxeoDirectory.countries;

      this.natures = NuxeoDirectory.natures;

      this.subjects = NuxeoDirectory.subjects;

      this.tags = NuxeoTag;
    }]);