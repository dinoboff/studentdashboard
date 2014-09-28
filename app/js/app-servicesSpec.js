/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject, expect */

(function() {
  'use strict';

  describe('scDashboard.services', function() {
    var $httpBackend, apiRoot;

    beforeEach(module('scDashboard.services', 'scDashboard.config'));

    beforeEach(inject(function(_$httpBackend_, SCD_API_BASE) {
      $httpBackend = _$httpBackend_;
      apiRoot = SCD_API_BASE;
    }));


    describe('scdDashboardBaseApi', function() {
      var api;

      beforeEach(inject(function(scdDashboardBaseApi) {
        api = scdDashboardBaseApi;
      }));

      it('should get collection as array', function() {
        $httpBackend.expectGET(apiRoot + '/foo').respond([]);
        api.all('foo').getList();
        $httpBackend.flush();
      });

      it('should get collection as object', function() {
        $httpBackend.expectGET(apiRoot + '/foo').respond({
          foo: []
        });
        api.all('foo').getList();
        $httpBackend.flush();
      });

      it('should get collection as object with explicit type', function() {
        var resp;

        $httpBackend.expectGET(apiRoot + '/foo').respond({
          type: 'bar',
          bar: [{
            foo: 2
          }]
        });
        api.all('foo').getList().then(function(_resp_) {
          resp = _resp_;
        });
        $httpBackend.flush();

        expect(resp[0].foo).toBe(2);
      });

      it('should get collection as object and include extra attributes', function() {
        var resp;

        $httpBackend.expectGET(apiRoot + '/foo').respond({
          foo: [],
          bar: 1
        });
        api.all('foo').getList().then(function(_resp_) {
          resp = _resp_;
        });
        $httpBackend.flush();

        expect(resp.bar).toBe(1);
      });
    });


    describe('scdDashboardApi', function() {
      var api;

      describe('scdDashboardApi.assessments', function() {

        beforeEach(inject(function(scdDashboardApi) {
          api = scdDashboardApi.assessments;
        }));

        it('should list all exams', function() {
          $httpBackend.expectGET(apiRoot + '/assessments/exams').respond([]);
          api.listExams();
          $httpBackend.flush();
        });

        it('should list all exams a student took part of', function() {
          $httpBackend.expectGET(apiRoot + '/assessments/exams?userId=1').respond([]);
          api.listExams(1);
          $httpBackend.flush();
        });

        it('should get an exam details', function() {
          $httpBackend.expectGET(apiRoot + '/assessments/exams/1234').respond({});
          api.getExamById('1234');
          $httpBackend.flush();
        });

        it('should get upload url', function() {
          $httpBackend.expectPOST(apiRoot + '/assessments/uploadurl').respond({
            url: '_upload/foo'
          });
          api.newUploadUrl();
          $httpBackend.flush();
        });
      });


      describe('scdDashboardApi.review', function() {

        beforeEach(inject(function(scdDashboardApi) {
          api = scdDashboardApi.review;
        }));

        it('should query student stats rank', function() {
          $httpBackend.expectGET(apiRoot + '/roshreview/stats').respond({
            stats: [],
            cursor: '',
          });
          api.listStats();
          $httpBackend.flush();
        });

        it('should query student stats rank with parameters', function() {
          var expected = {},
            params = {
              cursor: 'foo',
              residents: 'all',
              topic: 'all',
              stats: 'cumulativePerformance'
            },
            urlPattern = /roshreview\/stats\?(.+)$/;

          $httpBackend.expectGET(urlPattern).respond(function(m, url) {
            urlPattern.exec(url)[1].split('&').forEach(function(part) {
              var pair = part.split('=');
              expected[pair[0]] = pair[1];
            });
            return [200, {
              stats: [],
              cursor: '',
            }];
          });

          api.listStats(params);
          $httpBackend.flush();
          expect(expected).toEqual(params);
        });

        it('should query the topics', function() {
          $httpBackend.expectGET(apiRoot + '/roshreview/topic').respond([]);
          api.listTopics();
          $httpBackend.flush();
        });

        it('should query a student detailed stats', function() {
          var urlPattern = /\/roshreview\/stats\/([^\/]+)$/,
            studentId;

          $httpBackend.expectGET(urlPattern).respond(function(m, url) {
            studentId = urlPattern.exec(url)[1];
            return [200, {}];
          });
          api.getStats('A0001');
          $httpBackend.flush();

          expect(studentId).toBe('A0001');
        });

      });

    });

  });

})();
