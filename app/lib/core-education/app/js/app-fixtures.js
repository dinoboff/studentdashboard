/* jshint bitwise: false*/

(function() {
  'use strict';

  angular.module('scCoreEducationMocked.fixtures', []).

  constant('SC_CORE_EDUCATION_FIXTURES', {
    urls: {
      login: /\/api\/v1\/user($|\?.+)/,
      users: '/api/v1/users',
      students: '/api/v1/students',
      staff: '/api/v1/staff',
      newStaff: /\/api\/v1\/staff\/(\d+)/
    },
    data: {
      user: {
        'image': {
          'url': 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50',
          'isDefault': true
        },
        'emails': [{
          'type': 'account',
          'value': 'damien@example.com'
        }],
        'hasCredentials': true,
        'isStudent': true,
        'verified': false,
        'isLoggedIn': true,
        'domain': 'example.com',
        'isAdmin': false,
        'id': '12345',
        'loginUrl': '/api/login',
        'logoutUrl': '/_ah/login?continue=http%3A//localhost%3A8080/dashboard/&action=logout',
        'displayName': 'Damien Lebrun',
        'isDomainAdmin': false,
        'name': {
          'givenName': 'Damien',
          'familyName': 'Lebrun'
        },
        'isStaff': false
      },
      loginError: {
        'hasCredentials': false,
        'isStudent': false,
        'isLoggedIn': false,
        'isDomainAdmin': false,
        'isAdmin': false,
        'isStaff': false,
        'loginUrl': '/api/login'
      },
      userList: {
        '12345': {
          'image': {
            'url': 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50',
            'isDefault': true
          },
          'verified': false,
          'isStudent': true,
          'isStaff': true,
          'domain': 'chrisboesch.com',
          'displayName': 'Chris Boesch',
          'id': '12345',
          'name': {
            'givenName': 'Chris',
            'familyName': 'Boesch'
          }
        },
        '12346': {
          'image': {
            'url': 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50',
            'isDefault': true
          },
          'verified': false,
          'isStudent': true,
          'isStaff': false,
          'domain': 'chrisboesch.com',
          'displayName': 'Damien Lebrun',
          'id': '12346',
          'name': {
            'givenName': 'Damien',
            'familyName': 'Lebrun'
          }
        },
        '12347': {
          'image': {
            'url': 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50',
            'isDefault': true
          },
          'verified': false,
          'isStudent': false,
          'isStaff': false,
          'domain': null,
          'displayName': 'Bob Smith',
          'id': '12347',
          'name': {
            'givenName': 'Bob',
            'familyName': 'Smith'
          }
        },

      }
    }
  })

  ;

})();