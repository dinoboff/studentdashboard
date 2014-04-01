/* jshint camelcase: false*/
/* global describe, protractor, it, browser, takeScreenShot */

(function() {
  'use strict';

  describe('dashboard', function() {

    var ptor = protractor.getInstance(),
      httpBackendMock = function() {
        angular.module('httpBackendMock', ['ngMockE2E', 'scDashboard'])
          .run(function($httpBackend, $window) {
            $window.document.body.style.overflowY = 'hidden';

            $httpBackend.whenGET(/\/api\/v1\//).respond({
              isAdmin: true,
              isStaff: false,
              logoutUrl: '/logout',
              isStudent: false,
              name: 'test@example.com'
            });

            $httpBackend.whenGET('/api/v1/students').respond({
              'students': [{
                'firstName': 'Alice',
                'lastName': 'Smith',
                'id': 'x1'
              }, {
                'firstName': 'Bob',
                'lastName': 'Taylor',
                'id': 'x2'
              }],
              'cursor': 'E-ABAOsB8gEJZnVsbF9uYW1l-gENGgt0YXlsb3IsIGJvYuwBggInahRkZXZ-c3R1ZGVudGRhc2hib2FyZHIPCxIHU3R1ZGVudCICeDIMFA=='
            });

            $httpBackend.whenGET(/.*/).passThrough();

          });
      };

    ptor.addMockModule('httpBackendMock', httpBackendMock);

    it('should let an admin select a student repository', function() {
      browser.get('http://0.0.0.0:5557/app/');

      takeScreenShot('home');
    });

  });

})();