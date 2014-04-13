/* jshint bitwise: false*/

(function() {
  'use strict';

  function newFile(fileName, destId, destName, senderName) {
    senderName = senderName || 'system';

    return {
      'destId': destId,
      'name': fileName,
      'type': 'SHELF',
      'url': '/README.md',
      'sender': senderName,
      'lastDownloadAt': '',
      'dest': destName,
      'uploadedAt': 'Wed, 02 Apr 2014 21:39:03 -0000'
    };
  }

  angular.module('scDashboardMocked.fixtures', []).

  constant('SC_DASHBOARD_FIXTURES', {
    urls: {
      login: /\/api\/v1\/user/,
      students: '/api/v1/students',
      studentFiles: /\/api\/v1\/dashboard\/repository\/([^\/]+)\/files/,
      uploadUrl: /api\/v1\/dashboard\/repository\/([^\/]+)\/uploadurl/,
      upload: /_ah\/upload\/(.*)/
    },
    data: {
      user: {
        isAdmin: true,
        isLoggedIn: true,
        staffId: null,
        logoutUrl: '/logout',
        studentId: null,
        name: 'test@example.com'
      },
      students: {
        x1: {
          'firstName': 'Alice',
          'lastName': 'Smith',
          'id': 'x1'
        },
        x2: {
          'firstName': 'Bob',
          'lastName': 'Taylor',
          'id': 'x2'
        }
      },
      files: function(dest, count, senderName) {
        var results = [],
          destName = dest.firstName + ' ' + dest.lastName;

        while (count > 0) {
          results.push(
           newFile('File '+  count--, dest.id, destName, senderName)
          );
        }

        return results;
      },
      newFile: newFile,
      uploadUrl: {
        'url': '/_ah/upload/some-key'
      }
    }
  })

  ;

})();