(function() {
  'use strict';

  function echo(m, u, body) {
    var data = JSON.parse(body);
    return [200, data];
  }


  angular.module('scCoreEducationMocked', [
    'scCoreEducation', 'ngMockE2E', 'scCoreEducationMocked.fixtures'
  ]).


  run(function($httpBackend, SC_CORE_EDUCATION_FIXTURES) {
    var fix = SC_CORE_EDUCATION_FIXTURES;

    $httpBackend.whenGET(fix.urls.login).respond(fix.data.user);

    $httpBackend.whenGET(fix.urls.users).respond({
      type: 'users',
      users: Object.keys(fix.data.userList).map(function(id) {
        return fix.data.userList[id];
      }),
      cursor: null
    });

    $httpBackend.whenGET(fix.urls.students).respond({
      type: 'users',
      users: Object.keys(fix.data.userList).filter(function(id) {
        return fix.data.userList[id].isStudent;
      }).map(function(id) {
        return fix.data.userList[id];
      }),
      cursor: null
    });

    $httpBackend.whenPOST(fix.urls.students).respond(echo);


    $httpBackend.whenGET(fix.urls.staff).respond(function() {
      return [200, {
        type: 'users',
        users: Object.keys(fix.data.userList).filter(function(id) {
          return fix.data.userList[id].isStaff;
        }).map(function(id) {
          return fix.data.userList[id];
        }),
        cursor: null
      }];
    });

    $httpBackend.whenPOST(fix.urls.staff).respond(echo);

    $httpBackend.whenPUT(fix.urls.newStaff).respond(function(meth, url) {
      var userId = fix.urls.newStaff.exec(url)[1];
      fix.data.userList[userId].isStaff = true;
      return [200, {}];
    });

    $httpBackend.whenGET(/.*/).passThrough();

  })

  ;

})();