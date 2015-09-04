describe('ngNuxeoClient module', function () {
  'use strict';

  var httpBackend, nuxeo, nuxeoUser, dataDocuments, dataUser;

  beforeEach(module('ngNuxeoClient', 'data/documents.json', 'data/user.json'));

  beforeEach(inject(function ($httpBackend, _nuxeo_, _nuxeoUser_, _dataDocuments_, _dataUser_) {
    httpBackend = $httpBackend;
    nuxeo = _nuxeo_;
    nuxeoUser = _nuxeoUser_;
    dataDocuments = _dataDocuments_;
    dataUser = _dataUser_;
  }));

  describe('nuxeo.Document object', function () {

    it('is valid when instantiated with no argument', function () {
      expect(nuxeo.Document.name === 'Document').toBe(true);

      var doc = new nuxeo.Document();

      expect(typeof doc === 'object').toBe(true);
      expect(doc instanceof nuxeo.Document).toBe(true);
      expect(doc.constructor === nuxeo.Document).toBe(true);
      expect(nuxeo.Document.prototype instanceof nuxeo.Automation).toBe(true);

      expect(doc.isDeletable).toBeUndefined();
      expect(doc.isPublishable).toBeUndefined();
    });

    it('is valid when instantiated argument', function () {
      var doc = new nuxeo.Document(dataDocuments.entries[0]);

      expect(typeof doc === 'object').toBe(true);
      expect(doc instanceof nuxeo.Document).toBe(true);
      expect(doc.constructor === nuxeo.Document).toBe(true);
      expect(nuxeo.Document.prototype instanceof nuxeo.Automation).toBe(true);

      expect(doc.isDeletable).toBeDefined();
      expect(doc.isPublishable).toBeDefined();
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