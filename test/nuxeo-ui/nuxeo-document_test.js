describe('ngNuxeoUI module', function () {
  'use strict';

  var nuxeo, $compile, $scope, $templateCache;

  beforeEach(
    module(
      'ngNuxeoUI',
      'data/entry-picture.json', 'data/entry-audio.json',
      'expected/nuxeo-picture.html', 'expected/nuxeo-audio.html',
      'data/user.json'
    )
  );

  beforeEach(inject(function ($httpBackend, _nuxeo_, _$compile_, _$rootScope_, _nuxeoUser_, _$templateCache_) {
    nuxeo = _nuxeo_;
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $templateCache = _$templateCache_;

    _nuxeoUser_.id =_nuxeoUser_.pathId = 'Administrator';
  }));

  describe('nuxeoDocument directive', function () {

    it('should display an image when entry is a Picture', function () {

      inject(function (_dataEntryPicture_) {
        $scope.entry = new nuxeo.Document(_dataEntryPicture_);
      });

      var expectedPicture = $templateCache.get('expected/nuxeo-picture.html');

      // Compile a piece of HTML containing the directive
      var element = $compile('<nuxeo-document entry="entry" publish-to="{{publishPath}}" on-success="onSuccess()" on-error="onError()"></nuxeo-document>')($scope);
      // fire all the watches
      $scope.$digest();

      expect(element.html().ignoreUnsignificantChars()).toEqual(expectedPicture.ignoreUnsignificantChars());
    });

    it('should display audio when entry is a Audio', function () {
      inject(function (_dataEntryAudio_) {
        $scope.entry = new nuxeo.Document(_dataEntryAudio_);
      });

      var expectedAudio = $templateCache.get('expected/nuxeo-audio.html');

      // Compile a piece of HTML containing the directive
      var element = $compile('<nuxeo-document entry="entry" publish-to="{{publishPath}}" on-success="onSuccess()" on-error="onError()"></nuxeo-document>')($scope);
      // fire all the watches
      $scope.$digest();

      expect(element.html().ignoreUnsignificantChars()).toEqual(expectedAudio.ignoreUnsignificantChars());
    });
  });
});