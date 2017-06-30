describe('ngNuxeoClient module', function () {
  'use strict';

  var httpBackend, nuxeo, nuxeoUser, dataDocuments, dataUser, dataWorkspace;

  beforeEach(module('ngNuxeoClient', 'data/documents.json', 'data/user.json', 'data/workspace.json'));

  beforeEach(inject(function ($httpBackend, _nuxeo_, _nuxeoUser_, _dataDocuments_, _dataUser_, _dataWorkspace_) {
    httpBackend = $httpBackend;
    nuxeo = _nuxeo_;
    nuxeoUser = _nuxeoUser_;
    dataDocuments = _dataDocuments_;
    dataUser = _dataUser_;
    dataWorkspace = _dataWorkspace_;
  }));

  describe('nuxeo.Document object', function () {

    it('is valid when instantiated with no argument', function () {
      expect(nuxeo.Document.name === 'Document').toBe(true);

      var doc = new nuxeo.Document();

      expect(typeof doc === 'object').toBe(true);
      expect(doc instanceof nuxeo.Document).toBe(true);
      expect(doc.constructor === nuxeo.Document).toBe(true);
      expect(nuxeo.Document.prototype instanceof nuxeo.Automation).toBe(true);

      expect(doc.isDeletable).toBeFalsy();
      expect(doc.isPublishable).toBeFalsy();
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
      httpBackend.whenGET('http://demo.nuxeo.com/nuxeo/api/v1/user/Administrator').respond(dataUser);
      httpBackend.whenGET('http://demo.nuxeo.com/nuxeo/api/v1/query?query=' +
        'SELECT+*+FROM+Document+WHERE+ecm:path+%3D%22%2Fdefault-domain%2FUserWorkspaces%2Ffmaturel-github-com%22'
      ).respond(dataWorkspace);
      httpBackend.whenPOST('http://demo.nuxeo.com/nuxeo/site/automation/Document.Create').respond('{\"type": \"Document\"}');

      nuxeo.Document.create('webbanner', '/default-domain/sections', function (result) {
        expect(result).toBeDefined();
        expect(result.type).toEqual('Document');
      });

      nuxeoUser.login('Administrator', 'Administrator');

      httpBackend.flush();
    });
  });
});