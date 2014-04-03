/* jshint camelcase: false*/
/* global describe, protractor, it, browser, takeScreenShot, element, by, expect */

(function() {
  'use strict';

  var path = require('path'),
    readMe = path.resolve(__dirname, '../../README.md');

  describe('dashboard', function() {

    var ptor = protractor.getInstance(),
      httpBackendMock = function() {
        angular.module('httpBackendMock', ['ngMockE2E', 'scDashboard'])
          .run(function($httpBackend) {

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
                'type': 'SHELF',
                'url': '/api/v1/dashboard/repository/files/tKcnN9E5z4OFWNawW7WKaQ==',
                'sender': 'System',
                'lastDownloadAt': '',
                'dest': 'Smith, Alice',
                'uploadedAt': 'Wed, 02 Apr 2014 21:39:03 -0000'
              }, {
                'dest': 'Smith, Alice',
                'name': 'test',
                'type': 'SHELF',
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

            $httpBackend.whenPOST('http://0.0.0.0:8888/_ah/upload/some-key').respond({
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

      this.fileSelect = function() {
        return element(by.css('#file-select'));
      };

      this.fileTypeSelectOptions = function() {
        return element(by.css('#selected-doc-type')).
          findElements(by.tagName('option'));
      };

      this.fileName = function() {
        return element(by.css('#file-name'));
      };

      this.uploadButton = function() {
        return element(by.css('#upload-form button[type=submit]'));
      };

      this.get = function() {
        return browser.get('http://0.0.0.0:5557/app/');
      };

      this.selectStudent = function(index) {
        return this.studentOptions().then(function(options) {
          return options[index].click();
        });
      };

      this.selectFileType = function(index) {
        return this.fileTypeSelectOptions().then(function(options) {
          return options[index].click();
        });
      };

      this.selectFile = function(path) {
        return this.fileSelect().sendKeys(path);
      };

    };

    it('should let an admin select a student repository', function() {
      var page = new RepositoryHomepage();

      page.get();

      expect(page.studentSelector.isPresent()).toBe(true);

      takeScreenShot('home').then(function(){
        return page.studentSelector.click();
      }).then(page.studentOptions.bind(page)).then(function(options) {
        expect(options.length).toBe(3);
        options[1].click();
      }).then(function(){
        takeScreenShot('student-selected');
      }).then(page.files.bind(page)).then(function(files){
        expect(files.length).toBe(2);
      });

    });

    it('should let an admin upload a file', function() {
      var page = new RepositoryHomepage();

      page.selectStudent(1);
      expect(element(by.css('#upload-form')).isDisplayed()).toBe(true);
      page.selectFile(readMe);
      expect(page.fileName().getAttribute('value')).toBe('README.md');
      page.selectFileType(1);
      takeScreenShot('file-selected');

      var button = page.uploadButton();
      expect(page.uploadButton().isDisplayed()).toBe(true);
      button.click();


      page.files().then(function(files) {
        expect(files.length).toBe(3);
        takeScreenShot('file-uploaded');
      });

    });

  });

})();