(function() {
  'use strict';

  function PortfolioCtrl(selectedStudent, pfApi) {
    var self = this;

    this.pfApi = pfApi;
    this.portfolio = null;
    this.selector = null;

    selectedStudent().then(function(selector) {
      self.selector = selector;
    });
  }

  PortfolioCtrl.prototype.loadPortfolio = function(studentId) {
    var self = this;

    if (!studentId) {
      self.portfolio = null;
      return;
    }

    this.pfApi.getById(studentId).then(function(pf) {
      self.portfolio = pf;
    });
  };


  angular.module('scdPortfolio.controllers', ['scdSelector.services', 'scdPortFolio.services']).

  controller('scdPortfolioCtrl', ['scdSelectedStudent', 'scdPorfolioApi', PortfolioCtrl])

  ;

})();