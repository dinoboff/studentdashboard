(function() {
  'use strict';

  var module = angular.module(
    'scdPortfolio.controllers', [
      'ngRoute', 'scceUser.services', 'scdSelector.services', 'scdPortFolio.services'
    ]
  );

  /**
   * Portfolio controller
   *
   */
  module.controller('ScdPortfolioCtrl', [
    'currentUser',
    'scdPorfolioApi',
    'initialData',
    function ScdPortfolioCtrl(currentUser, scdPorfolioApi, initialData) {
      var self = this;

      this.portfolio = initialData.portfolio;
      this.selector = initialData.selector;

      this.loadPortfolio = function(studentId) {
        if (!studentId) {
          self.portfolio = null;
          return;
        }

        scdPorfolioApi.getById(studentId).then(function(pf) {
          self.portfolio = pf;
        });
      };
    }
  ]);

  /**
   * Portfolio controller InitialData resolver
   *
   * Returns a promise resolving to an object containing:
   * - `selector`, for the student selector.
   * - `portfolio`, holding the portfolio of the currently selected student.
   *
   * Should be used to resolve `initialData` of `ScdPortfolioCtrl`.
   *
   */
  module.factory('scdPortfolioCtrlInitialData', [
    '$q',
    'scdSelectedStudent',
    'scdPorfolioApi',
    function scdPortfolioCtrlInitialDataFactory($q, scdSelectedStudent, scdPorfolioApi) {
      return function() {
        var selectorPromise = scdSelectedStudent();

        return $q.all({
          selector: selectorPromise,
          portfolio: selectorPromise.then(function(selector) {
            if (selector.selectedId) {
              return scdPorfolioApi.getById(selector.selectedId);
            }
          })
        });
      };
    }
  ]);


  /**
   * Student Exam controller
   *
   */
  module.controller('ScdPortfolioStudentExamCtrl', [
    '$window',
    'scdPfSvgLayout',
    'initialData',
    function ScdPfExamCtrl(window, layout, initialData) {
      var self = this,
        d3 = window.d3,
        _ = window._;

      this.studentId = initialData.studentId;
      this.examId = initialData.examId;
      this.exam = initialData.exam;
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

      _.forEach(this.exam.results, function(result) {
        self.yScale(result.topic.name);
      });
      this.yScale = self.yScale.rangePoints([self.layout.innerHeight, 0], 1);
    }
  ]);

  /**
   * Student Exam controller InitialData resolver
   *
   * Resolve to an object containing:
   * - `examId`, for the exam id.
   * - `studentId`, for the student id the results belong to.
   * - `exam`, for the exam data.
   *
   * Should be used to resolve `initialData` of `ScdPortfolioStudentExamCtrl`.
   */
  module.factory('scdPortfolioStudentExamCtrlInitialData', [
    '$q',
    '$route',
    'scceCurrentUserApi',
    'scdPorfolioApi',
    function($q, $route, scceCurrentUserApi, scdPorfolioApi) {
      return function() {
        var studentId = $route.current.params.studentId,
          examId = $route.current.params.examId,
          examPromise = scceCurrentUserApi.auth().then(function(user) {
            if (!user.isStaff && !user.isAdmin && user.id !== studentId) {
              return $q.reject('You do not have permission to see those results');
            }

            return scdPorfolioApi.getExamById(studentId, examId);
          });

        return $q.all({
          studentId: studentId,
          examId: examId,
          exam: examPromise
        });
      };
    }
  ]);

})();