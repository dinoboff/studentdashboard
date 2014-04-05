/* jshint bitwise: false*/

(function() {
  'use strict';

  angular.module('scDashboardMocked', ['scDashboard', 'ngMockE2E', 'scDashboardMocked.fixtures']).

  run(['$httpBackend', 'SC_DASHBOARD_FIXTURES',
    function($httpBackend, fixtures) {
      var files = {},
        students = fixtures.data.students;

      $httpBackend.whenGET(fixtures.urls.login).respond(fixtures.data.user);

      $httpBackend.whenGET(fixtures.urls.students).respond({
        students: Object.keys(students).map(function(id) {
          return students[id];
        }),
        cursor: null
      });

      files = {};
      Object.keys(students).forEach(function(id) {
        var dest = students[id];
        files[dest.id] = fixtures.data.files(dest, Math.round(Math.random() * 10));
      });

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

      $httpBackend.whenPOST(fixtures.urls.uploadUrl).respond(function(m, url) {
        lastStudentId = fixtures.urls.uploadUrl.exec(url)[1];
        return [200, fixtures.data.uploadUrl];
      });

      $httpBackend.whenPOST(fixtures.urls.upload).respond(function() {
        var dest = students[lastStudentId] ;
        return [
          200,
          fixtures.data.newFile(
            'new file ' + newFileCount++,
            dest.id,
            dest.firstName + ' ' + dest.lastName
          )
        ];
      });

      $httpBackend.whenGET(/.*/).passThrough();
    }
  ])

  ;

})();