/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject, expect */

(function() {
  'use strict';

  describe('scdRepository.services', function() {
    var $httpBackend, scope, $;

    beforeEach(module('scdRepository.services'));

    beforeEach(inject(function(_$httpBackend_, $rootScope, $window) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope.$new();
      $ = $window.jQuery;
    }));

    describe('scdRepositoryApi', function() {
      var api;

      beforeEach(inject(function(scdRepositoryApi) {
        api = scdRepositoryApi;
      }));

      it('should query the documents list available for a student', function() {
        var list;

        api.getRepositoryById('x1').then(function(_list) {
          list = _list;
        });

        $httpBackend.expectGET(
          '/api/v1/dashboard/repository/x1/files'
        ).respond({
          files: [{
            name: 'foo.pdf',
            url: '/api/v1/dashboard/repository/files/1234.pdf',
            sender: 'alice smith'
          }]
        });
        $httpBackend.flush();

        expect(list.length).toBe(1);
        expect(list[0].name).toBe('foo.pdf');
      });

      it('should request a new upload file url', function() {
        var resp;

        api.newUploadUrl('x1').then(function(_resp) {
          resp = _resp;
        });

        $httpBackend.expectPOST(
          '/api/v1/dashboard/repository/x1/uploadurl'
        ).respond({url: '/foo'});
        $httpBackend.flush();

        expect(resp.url).toBeTruthy();
      });
    });
  });


})();