/* jshint bitwise: false*/

(function() {
  'use strict';

  angular.module('scDashboardMocked', ['scDashboard', 'ngMockE2E', 'scDashboardMocked.fixtures']).

  run(['$httpBackend', '$window', 'SC_DASHBOARD_FIXTURES',
    function($httpBackend, $window, fixtures) {
      var _ = $window._,
        files = {},
        students = fixtures.data.students;

      // Login
      $httpBackend.whenGET(fixtures.urls.login).respond(fixtures.data.user);

      // Student list
      $httpBackend.whenGET(fixtures.urls.students).respond({
        students: Object.keys(students).map(function(id) {
          return students[id];
        }),
        cursor: null
      });

      // Files
      files = {};
      Object.keys(students).forEach(function(id) {
        var dest = students[id];
        files[dest.id] = fixtures.data.files(dest, Math.round(Math.random() * 10));
      });

      // Get file list
      $httpBackend.whenGET(fixtures.urls.studentFiles).respond(function(m, url) {
        var id = fixtures.urls.studentFiles.exec(url)[1],
          resp = {
            files: []
          };

        if (files[id]) {
          resp.files = files[id];
        }
        return [200, resp];
      });

      var lastStudentId, newFileCount = 1;

      // upload file url
      $httpBackend.whenPOST(fixtures.urls.uploadUrl).respond(function(m, url) {
        lastStudentId = fixtures.urls.uploadUrl.exec(url)[1];
        return [200, fixtures.data.uploadUrl];
      });

      // upload file
      $httpBackend.whenPOST(fixtures.urls.upload).respond(function() {
        var dest = students[lastStudentId];
        return [
          200,
          fixtures.data.newFile(
            'new file ' + newFileCount++,
            dest.id,
            dest.displayName
          )
        ];
      });

      // Assessments

      // Exam list
      $httpBackend.whenGET(fixtures.urls.exams).respond(function(m, url) {
        var userId = fixtures.urls.exams.exec(url)[1];

        if (!userId) {
          return [200, {
            exams: fixtures.data.getExamList(),
            cursor: ''
          }];
        }

        if (!students[userId]) {
          return [404, {error: 'not found'}];
        }

        return [200, {
          user: students[userId],
          exams: fixtures.data.getExamListByStudentId(userId),
          cursor: ''
        }];
      });

      // Exam details
      $httpBackend.whenGET(fixtures.urls.exam).respond(function(m, url) {
        var examId = fixtures.urls.exam.exec(url)[1];

        if (!examId || !fixtures.data.exams[examId]) {
          return [404, {error: 'not found'}];
        }

        return [200, fixtures.data.exams[examId]];
      });

      // Exam Upload
      $httpBackend.whenPOST(fixtures.urls.examUploadUrl).respond({
        url: fixtures.urls.examUpload
      });

      $httpBackend.whenPOST(fixtures.urls.examUpload).respond(function() {
        var exam = fixtures.data.newExam(_.size(fixtures.data.exams + 1));
        return [200, exam];
      });

      // Portfolio
      //
      // TODO: deprecate it.

      // Student portfolio
      $httpBackend.whenGET(fixtures.urls.portfolio).respond(function(m, url) {
        var id = fixtures.urls.portfolio.exec(url)[1];

        return [200, {
          id: id,
          student: fixtures.data.students[id],
          examSeries: fixtures.data.exams
        }];
      });

      // exam result
      $httpBackend.whenGET(fixtures.urls.portfolioExam).respond(function(m, url) {
        var examId = fixtures.urls.portfolioExam.exec(url)[2];

        return [200, fixtures.data.examResults[examId]];
      });

      // Everything else go.
      $httpBackend.whenGET(/.*/).passThrough();
    }
  ])

  ;

})();