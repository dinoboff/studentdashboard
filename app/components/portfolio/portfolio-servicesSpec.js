/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject */

(function() {
  'use strict';

  describe('scdPortFolio.services', function() {
    var $httpBackend, scope, auth, fix;

    beforeEach(module('scdPortFolio.services', 'scDashboardMocked.fixtures'));

    beforeEach(inject(function(_$rootScope_, _$httpBackend_, scceCurrentUserApi, SC_DASHBOARD_FIXTURES) {
      $httpBackend = _$httpBackend_;
      fix = SC_DASHBOARD_FIXTURES;
      scope = _$rootScope_;
      auth = scceCurrentUserApi;
    }));

    describe('scdPorfolioApi', function() {
      var api;

      beforeEach(inject(function(scdPorfolioApi) {
        api = scdPorfolioApi;
      }));

      it('should query a portfolio', function() {
        $httpBackend.expectGET('/api/v1/dashboard/portfolio/x1').respond({});
        api.getById('x1');
        $httpBackend.flush();
      });
    });


  });

})();