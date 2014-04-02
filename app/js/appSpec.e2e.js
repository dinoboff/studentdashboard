/* jshint camelcase: false*/
/* global describe, protractor, it, browser, takeScreenShot, element, by, expect */

(function() {
  'use strict';

  describe('dashboard', function() {

    var ptor = protractor.getInstance(),
      httpBackendMock = function() {
        angular.module('httpBackendMock', ['ngMockE2E', 'scDashboard'])
          .run(function($httpBackend, $window) {
            $window.document.body.style.overflowY = 'hidden';

            $httpBackend.whenGET(/\/api\/v1\/user/).respond({
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

            $httpBackend.whenGET('/api/v1/dashboard/repository/x1/files').respond({
              'files': [{
                'destId': 'x1',
                'name': 'test (1)',
                'url': '/api/v1/dashboard/repository/files/tKcnN9E5z4OFWNawW7WKaQ==',
                'sender': 'System',
                'lastDownloadAt': '',
                'dest': 'Smith, Alice',
                'uploadedAt': 'Wed, 02 Apr 2014 21:39:03 -0000'
              }, {
                'dest': 'Smith, Alice',
                'name': 'test',
                'url': '/api/v1/dashboard/repository/files/VXZzPGy5lw9sq2z_9ANqsA==',
                'sender': 'System',
                'lastDownloadAt': '',
                'uploadedAt': 'Wed, 02 Apr 2014 21:31:42 -0000',
                'destId': 'x1'
              }],
              'cursor': 'E-ABAOsB8gELdXBsb2FkZWRfYXT6AQkI98SWrqPCvQLsAYICOmoUZGV2fnN0dWRlbnRkYXNoYm9hcmRyIgsSBEZpbGUiGDRSYlBuS0xBUFgtb1JfR0xQQUZ3N1E9PQwU'
            });

            $httpBackend.whenPOST('/api/v1/dashboard/repository/x1/uploadurl').respond({
              'url': 'http://0.0.0.0:8888/_ah/upload/some-key'
            });

            $httpBackend.whenPOST('/_ah/upload/some-key').respond({
              'destId': 'x1',
              'name': 'download',
              'url': '/api/v1/dashboard/repository/files/cz_nR76O_kT5rFWy1sdrqw==',
              'sender': 'System',
              'lastDownloadAt': '',
              'dest': 'Smith, Alice',
              'uploadedAt': 'Wed, 02 Apr 2014 23:16:53 -0000'
            });

            $httpBackend.whenGET(/.*/).passThrough();


          });
      };

    ptor.addMockModule('httpBackendMock', httpBackendMock);

    var RepositoryHomepage = function() {
      this.studentSelector = element(by.css('#selected-student'));

      this.files = function() {
        return element.all(by.css('.file-details'));
      };

      this.studentOptions = function() {
        return this.studentSelector.findElements(by.tagName('option'));
      };

      this.get = function() {
        return browser.get('http://0.0.0.0:5557/app/');
      };

      this.selectStudent = function(index) {
        return this.studentSelector.findElements(by.tagName('option')).then(function(options) {
          options[index].click();
        });
      };

    };

    it('should let an admin select a student repository', function() {
      var page = new RepositoryHomepage();

      page.get();

      expect(page.studentSelector.isPresent()).toBe(true);

      takeScreenShot('home').then(function(){
        return page.studentSelector.click();
      }).then(function() {
        return page.studentOptions();
      }).then(function(options) {
        expect(options.length).toBe(3);
        options[1].click();
        return takeScreenShot('student-selected');
      }).then(function(){
        return page.files();
      }).then(function(files){
        expect(files.length).toBe(2);
      });



      // page.selectStudent(1);

    });

  });

})();