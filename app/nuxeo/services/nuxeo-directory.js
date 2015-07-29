angular.module('ngNuxeoClient')

  .service('NuxeoDirectory', ['nuxeoClient', '$log',
    function (nuxeoClient, $log) {

      this.continents = nuxeoClient.request('directory/continent');

      this.countries = nuxeoClient.request('directory/country');

      this.natures = nuxeoClient.request('directory/nature');

      this.subjects = nuxeoClient.request('directory/subject');

    }]);