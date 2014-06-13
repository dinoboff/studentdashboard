(function() {
  'use strict';

  /**
   * Portfolio controller
   *
   */
  function PortfolioCtrl(selectedStudent, pfApi) {
    var self = this;

    this.pfApi = pfApi;
    this.portfolio = null;
    this.selector = null;

    selectedStudent().then(function(selector) {
      self.selector = selector;
      if (selector.selectedId) {
        self.loadPortfolio(selector.selectedId);
      }
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

  /**
   * Exam controller
   *
   */
  function PfExamCtrl($routeParams, currentUserApi, $q, pfApi, window, layout) {
    var self = this,
      studentId = $routeParams.studentId,
      examId = $routeParams.examId,
      d3 = window.d3,
      _ = window._;

    this.exam = null;
    this.layout = layout({
      top: 10,
      right: 10,
      bottom: 30,
      left: 300
    });

    this.xScale = d3.scale.linear().domain(
      [-2, 2]
    ).range(
      [0, this.layout.innerWidth]
    );
    this.ticks = _.range(-20, 21).map(function(x) {
      return x / 10;
    });
    this.yScale = d3.scale.ordinal();

    currentUserApi.auth().then(function(user) {
      if (!user.staffId && !user.isAdmin && user.studenId !== studentId) {
        return $q.reject('You do not have permission to see those results');
      }
      return pfApi.getExamById(studentId, examId);
    }).then(function(exam) {

      self.exam = exam;

      _.forEach(exam.results, function(result) {
        self.yScale(result.topic.name);
      });
      self.yScale = self.yScale.rangePoints([self.layout.innerHeight, 0], 1);
    }).catch(function() {
      // TODO: proper handling of error.
      window.alert('failed to load the exam results.');
    });
  }

  /**
   * Evaluation controller
   *
   */
  function PfEvaluationCtrl(params, currentUserApi, $q, pfApi) {
    var self = this,
      studentId = params.studentId,
      evaluationId = params.evaluationId;

    this.evaluation = null;

    currentUserApi.auth().then(function(user) {
      if (!user.staffId && !user.isAdmin && user.studenId !== studentId) {
        return $q.reject('You do not have permission to see those results');
      }
      return pfApi.getEvaluationById(studentId, evaluationId);
    }).then(function(evaluation) {
      self.evaluation = evaluation;
    }).catch(function() {
      // TODO: proper handling of error.
      window.alert('failed to load the evaluation results.');
    });
  }


  angular.module('scdPortfolio.controllers', ['scceUser.services', 'scdSelector.services', 'scdPortFolio.services']).

  controller('scdPortfolioCtrl', ['scdSelectedStudent', 'scdPorfolioApi', PortfolioCtrl]).
  controller('scdPfExamCtrl', [
    '$routeParams',
    'scceCurrentUserApi',
    '$q',
    'scdPorfolioApi',
    '$window',
    'scdPfSvgLayout',
    PfExamCtrl
  ]).
  controller('scdPfEvaluationCtrl', [
    '$routeParams',
    'scceCurrentUserApi',
    '$q',
    'scdPorfolioApi',
    PfEvaluationCtrl
  ])

  ;

})();