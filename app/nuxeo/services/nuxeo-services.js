angular.module('ngNuxeoClient')

  .service('nuxeo', ['NuxeoDirectory', 'NuxeoFile', 'NuxeoQuery', 'NuxeoTag',
    function (NuxeoDirectory, NuxeoFile, NuxeoQuery, NuxeoTag) {

      this.continents = NuxeoDirectory.continents;

      this.countries = NuxeoDirectory.countries;

      this.natures = NuxeoDirectory.natures;

      this.subjects = NuxeoDirectory.subjects;

      this.File = NuxeoFile;

      this.Query = NuxeoQuery;

      this.tags = NuxeoTag;
    }]);