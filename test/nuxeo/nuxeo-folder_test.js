describe('ngNuxeoClient module', function () {
  'use strict';

  var httpBackend, nuxeo, nuxeoUser,
    dataUser, dataDirectory, dataDocuments;

  beforeEach(module('ngNuxeoClient', 'data/user.json', 'data/directory.json', 'data/documents.json'));

  beforeEach(inject(function ($httpBackend, _nuxeo_, _nuxeoUser_, _dataUser_, _dataDirectory_, _dataDocuments_) {
    httpBackend = $httpBackend;
    nuxeo = _nuxeo_;
    nuxeoUser = _nuxeoUser_;
    dataUser = _dataUser_;
  }));

  describe('nuxeo service', function () {

    it('should create a Section when requested', function () {
      httpBackend.whenGET('http://demo.nuxeo.local/nuxeo/site/api/v1/user/Administrator').respond(dataUser);

      httpBackend.whenPOST('http://demo.nuxeo.local/nuxeo/site/automation/Document.Create').respond(dataUser);

      nuxeo.Section.create('webbanner', '/default-domain/sections', function (result) {
        expect(result).toBeDefined();
        expect(result.status).toEqual(200);
      });

      nuxeoUser.login('Administrator', 'Administrator');

      httpBackend.flush();
    });
  });
});