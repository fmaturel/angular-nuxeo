'use strict';

describe('ngNuxeoClient module', function () {

  var httpBackend, nuxeoClient, dataDirectory;

  beforeEach(module('ngNuxeoClient', 'data/directory.json'));

  beforeEach(inject(function ($httpBackend, _nuxeoClient_, _dataDirectory_) {
    httpBackend = $httpBackend;
    nuxeoClient = _nuxeoClient_;
    dataDirectory = _dataDirectory_;
  }));

  describe('nuxeoClient service', function () {

    it("should fetch directories when requested", function () {
      httpBackend.whenGET("http://demo.nuxeo.local/nuxeo/site/api/v1/directory/something").respond(dataDirectory);
      nuxeoClient.request('directory/something').get(function (result) {
        expect(result).toBeDefined();
        expect(result.entries).toBeDefined();
        expect(result.entries).toEqual(dataDirectory.entries);
      });
      httpBackend.flush();
    });

  });
});