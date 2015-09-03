describe('ngNuxeoClient module', function () {
  'use strict';

  var httpBackend, nuxeo, nuxeoUser, dataUser;

  beforeEach(module('ngNuxeoClient', 'data/user.json'));

  beforeEach(inject(function ($httpBackend, _nuxeo_, _nuxeoUser_, _dataUser_) {
    httpBackend = $httpBackend;
    nuxeo = _nuxeo_;
    nuxeoUser = _nuxeoUser_;
    dataUser = _dataUser_;
  }));

  describe('nuxeo.Document object', function () {

    it('is valid when instantiated', function () {
      expect(nuxeo.Document.name === 'Document').toBe(true);

      var doc = new nuxeo.Document();

      expect(typeof doc === 'object').toBe(true);
      expect(doc instanceof nuxeo.Document).toBe(true);
      expect(doc.constructor === nuxeo.Document).toBe(true);

      expect(doc.upload).toBeDefined();
    });

    it('has parameters passed in instantiation', function () {
      var doc = new nuxeo.Document({name: 'myDocument', type: 'Picture'});

      expect(doc.name).toEqual('myDocument');
      expect(doc.type).toEqual('Picture');
    });
  });

  describe('nuxeo.Document', function () {

    it('should create a Document when requested', function () {
      httpBackend.whenGET('http://demo.nuxeo.local/nuxeo/site/api/v1/user/Administrator').respond(dataUser);

      httpBackend.whenPOST('http://demo.nuxeo.local/nuxeo/site/automation/Document.Create').respond('{}');

      nuxeo.Document.create('webbanner', '/default-domain/sections', function (result) {
        expect(result).toBeDefined();
        expect(result.status).toEqual(200);
      });

      nuxeoUser.login('Administrator', 'Administrator');

      httpBackend.flush();
    });
  });
});