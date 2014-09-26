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
        files[dest.studentId] = fixtures.data.files(dest, Math.round(Math.random() * 10));
      });

      // Get file list
      $httpBackend.whenGET(fixtures.urls.studentFiles).respond(function(m, url) {
        var studentId = fixtures.urls.studentFiles.exec(url)[1],
          resp = {
            files: []
          };

        if (files[studentId]) {
          resp.files = files[studentId];
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
        var dest = _.find(students, {studentId: lastStudentId});
        return [
          200,
          fixtures.data.newFile(
            'new file ' + newFileCount++,
            dest.studentId,
            dest.displayName
          )
        ];
      });

      // Assessments

      // Exam list
      $httpBackend.whenGET(fixtures.urls.exams).respond(function(m, url) {
        var resp, userId = fixtures.urls.exams.exec(url)[1];

        if (!userId) {
          resp = [200, {
            exams: fixtures.data.getExamList(),
            cursor: ''
          }];
          return resp;
        }

        if (!students[userId]) {
          return [404, {error: 'not found'}];
        }

        resp = [200, {
          user: students[userId],
          exams: fixtures.data.getExamListByUserId(userId),
          cursor: ''
        }];
        return resp;
      });

      // Exam details
      $httpBackend.whenGET(fixtures.urls.exam).respond(function(m, url) {
        var examId = fixtures.urls.exam.exec(url)[1];

        if (!examId || !fixtures.data.exams[examId]) {
          return [404, {error: 'not found'}];
        }

        var resp = fixtures.data.exams[examId];
        return [200, resp];
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
