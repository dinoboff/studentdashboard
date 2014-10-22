(function() {
  'use strict';

  var module = angular.module(
    'scdPortfolio.controllers', [
      'ngRoute', 'scdSelector.services', 'scdPortFolio.services'
    ]
  );

  /**
   * Portfolio controller
   *
   */
  module.controller('ScdPortfolioCtrl', [
    'scdDashboardApi',
    'initialData',
    function ScdPortfolioCtrl(scdDashboardApi, initialData) {
      var self = this;

      this.portfolio = initialData.portfolio;
      this.selector = initialData.selector;
      this.globalsResults = initialData.globalsResults;
      this.showGlobals = false;

      this.loadPortfolio = function(studentId) {
        if (!studentId) {
          self.portfolio = null;
          return;
        }

        this.showGlobals = false;
        scdDashboardApi.assessments.listExams(studentId).then(function(pf) {
          self.portfolio = pf;
        });
      };

      this.showGlobalResults = function(doShow) {
        this.showGlobals = doShow;
        if (!doShow) {
          return;
        }

        if (!self.selector.available) {
          self.showGlobals = false;
          // TODO: redirect.
        } else {
          self.selector.selected.studentId = null;
        }
      };

      this.addGlobalResult = function(result) {
        if (self.globalsResults && self.globalsResults.unshift) {
          self.globalsResults.unshift(result);
        }
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
    'scdDashboardApi',
    function scdPortfolioCtrlInitialDataFactory($q, scdSelectedStudent, scdDashboardApi) {
      return function() {
        var selectorPromise = scdSelectedStudent();

        return $q.all({
          selector: selectorPromise,
          portfolio: selectorPromise.then(function(selector) {
            if (selector.selected.studentId) {
              return scdDashboardApi.assessments.listExams(selector.selected.studentId);
            }
          }),
          globalsResults: selectorPromise.then(function(selector) {
            if (selector.available) {
              return scdDashboardApi.assessments.listExams();
            }
          })
        });
      };
    }
  ]);

  /**
   * Exam stats controller.
   *
   */
  module.controller('ScdPortfolioExamStatsCtrl', [
    'initialData',
    function ScdPortfolioExamStatsCtrl(initialData) {
      this.exam = initialData.exam;
    }
  ]);

  module.factory('scdPortfolioExamStatsCtrlInitialData', [
    '$q',
    '$route',
    'scdDashboardApi',
    function scdPortfolioExamStatsCtrlInitialDataFactory($q, $route, scdDashboardApi) {
      return function() {
        var examId = $route.current.params.examId;

        return $q.all({
          examId: examId,
          exam: scdDashboardApi.assessments.getExamById(examId)
        });
      };
    }
  ]);

  /**
   * Exam result upload controller
   *
   */
  module.controller('ScdAssessmentUploadFileCtrl', [
    '$upload',
    'scdDashboardApi',
    function($upload, scdDashboardApi) {
      var self = this;

      this.selected = {};

      this.reset = function() {
        this.fileMeta = {};
        this.selected.file = null;
        this.showProgress = false;
        this.progress = 0;
      };

      function onProgress(evt) {
        self.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      }

      function uploadFile(file, cb) {

        scdDashboardApi.assessments.newUploadUrl().then(function(uploadInfo) {
          self.upload = $upload.upload({
            url: uploadInfo.url,
            method: 'POST',
            withCredentials: true,
            data: {
              name: self.fileMeta.name || file.name
            },
            file: file
          }).progress(
            onProgress
          ).success(
            function onSucess(data) {
              if (cb) {
                cb(data);
              }

              self.success = 'Results uploaded.';
              self.selected.file = null;
              self.reset();
            }
          );
        });
      }

      this.onFileSelect = function(file) {
        this.fileMeta.name = file.name;
      };

      this.uploadButtonClicked = function(file, cb) {
        uploadFile(file, cb);
        this.showProgress = true;
      };

      this.reset();
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
    'scdDashboardApi',
    'scdPorfolioApi',
    function($q, $route, scdDashboardApi, scdPorfolioApi) {
      return function() {
        var studentId = $route.current.params.studentId,
          examId = $route.current.params.examId,
          examPromise = scdDashboardApi.auth.auth().then(function(user) {
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
