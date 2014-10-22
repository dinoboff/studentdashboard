/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject */

(function() {
  'use strict';

  describe('scdPortFolio.services', function() {
    var $httpBackend, scope, fix;

    beforeEach(module('scdPortFolio.services', 'scDashboardMocked.fixtures'));

    beforeEach(inject(function(_$rootScope_, _$httpBackend_, SC_DASHBOARD_FIXTURES) {
      $httpBackend = _$httpBackend_;
      fix = SC_DASHBOARD_FIXTURES;
      scope = _$rootScope_;
    }));

    describe('scdPorfolioApi', function() {
      var api;

      beforeEach(inject(function(scdPorfolioApi) {
        api = scdPorfolioApi;
      }));

      it('should query a portfolio', function() {
        $httpBackend.expectGET('/api/v1/dashboard/portfolio/12345').respond({});
        api.getById('12345');
        $httpBackend.flush();
      });
    });


  });

})();
