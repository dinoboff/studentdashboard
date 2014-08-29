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

  factory('SC_DASHBOARD_FIXTURES', ['$window',
    function(window) {
      var _ = window._,
        fix;

      // function getRandomArbitary(min, max) {
      //   return window.Math.random() * (max - min) + min;
      // }

      fix = {
        urls: {
          login: /\/api\/v1\/user/,
          exams: /\/api\/v1\/dashboard\/assessments\/exams(?:\?userId=(.+))?$/,
          exam: /\/api\/v1\/dashboard\/assessments\/exams\/(\d+)$/,
          examUploadUrl: /\/api\/v1\/dashboard\/assessments\/uploadurl$/,
          examUpload: '/_exam/upload',
          students: '/api/v1/students',
          studentFiles: /\/api\/v1\/dashboard\/repository\/([^\/]+)\/files/,
          uploadUrl: /api\/v1\/dashboard\/repository\/([^\/]+)\/uploadurl/,
          upload: /_ah\/upload\/(.*)/,
          // Deprecated, should use the assessments and users endpoint instead
          portfolio: /\/api\/v1\/dashboard\/portfolio\/([^\/]+)$/,
          portfolioExam: /\/api\/v1\/dashboard\/portfolio\/([^\/]+)\/exam\/([^\/]+)$/,
          portfolioEvaluation: /\/api\/v1\/dashboard\/portfolio\/([^\/]+)\/evaluation\/([^\/]+)$/,
        },
        data: {
          user: {
            'image': {
              'url': 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50',
              'isDefault': true
            },
            'emails': [{
              'type': 'account',
              'value': 'chris@example.com'
            }],
            'hasCredentials': true,
            'isStudent': true,
            'verified': false,
            'isLoggedIn': true,
            'domain': 'example.com',
            'isAdmin': true,
            'id': '12345',
            'loginUrl': '/api/login',
            'logoutUrl': '/_ah/login?continue=http%3A//localhost%3A8080/dashboard/&action=logout',
            'displayName': 'Chris Boesch',
            'name': {
              'givenName': 'Chris',
              'familyName': 'Boesch'
            },
            'isStaff': true
          },
          studentUser: {
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
          students: {
            '12345': {
              'image': {
                'url': 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50',
                'isDefault': true
              },
              'studentId': 'A00001',
              'isStudent': true,
              'isStaff': true,
              'isAdmin': true,
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
              'studentId': 'A00002',
              'isStudent': true,
              'isStaff': false,
              'isAdmin': false,
              'domain': 'chrisboesch.com',
              'displayName': 'Damien Lebrun',
              'id': '12346',
              'name': {
                'givenName': 'Damien',
                'familyName': 'Lebrun'
              }
            }
          },
          exams: {},
          examFields: [
            'Bahvioral Sciences',
            'Biochemitry',
            'Biostatistics & Epidemiology',
            'Cardiovascular System',
            'Gastrointestinal System',
            'General Principles of Heatlth & Diseases',
            'Genetics',
            'Gross Anatomy & Embryology',
            'Hematpoletic & Lymphoreticular Systems',
            'Histology & immunology',
            'Medicine',
            'Musculoskeletal, Skin & Connective Tissue',
            'Nervous System/Special Senses',
            'Nutrition',
            'Pathology',
            'Pharmacology',
            'Physiology',
            'Renal/Urinary System',
            'Reproductive & Endocrine Systems',
            'Respiratory System',
            'Surgery'
          ],
          newExam: function(id, name) {
            name = name || 'Exam ' + id;
            this.exams[id] = {
              id: id + '',
              name: name,
              createdAt: (new Date()).toISOString(),
              processed: false,
              studentResults: [],
              questions: [],
              stats: {}
            };
            return this.exams[id];
          },
          getExamList: function() {
            return _.sortBy(_.map(this.exams, function(exam) {
              return _.omit(exam, ['studentResults']);
            }), function(exam) {
              return -(new Date(exam.createdAt)).getTime();
            });
          },
          getExamListByUserId: function(userId) {
            var student = this.students[userId],
              studentId = student.studentId;

            return _.sortBy(_.map(this.exams, function(exam) {
              var result = _.find(exam.studentResults, {
                  studentId: studentId
                }),
                resultStats = result.stats.all.user;

              exam = _.omit(exam, ['studentResults']);
              exam.questions = result.results;
              exam.stats.all.user = resultStats;

              return exam;
            }), function(exam) {
              return -(new Date(exam.createdAt)).getTime();
            });
          },
          files: function(dest, count, senderName) {
            var results = [],
              destName = dest.displayName;

            while (count > 0) {
              results.push(
                newFile('File ' + count--, dest.id, destName, senderName)
              );
            }

            return results;
          },
          newFile: newFile,
          uploadUrl: {
            'url': '/_ah/upload/some-key'
          },
          portfolio: {}
        }
      };

      // Generate exams
      _.range(1, 9).forEach(function(i) {
        fix.data.newExam(i + '');
      });

      // Generate exam results
      _.forEach(fix.data.exams, function(exam) {
        var overallResults;

        exam.questions = _.range(1, 51).map(function(i) {
          return {
            id: i,
            topic: null,
          };
        });

        exam.studentResults = _.map(fix.data.students, function(student) {
          var results = exam.questions.map(function(q) {
            return {
              id: q.id,
              value: _.sample([1, 1, 1, 0]) // 75% average success rate.
            };
          });

          return {
            id: exam.id,
            studentId: student.studentId,
            results: results,
            stats: {
              all: {
                id: 'all',
                name: 'Overall',
                user: results.reduce(function(sum, q) {
                  return sum + q.value;
                }, 0) / results.length
              }
            }
          };
        });

        overallResults = exam.studentResults.map(function(results) {
          return results.stats.all.user;
        });

        exam.stats.all = {
          id: 'all',
          name: 'Overall',
          mean: overallResults.reduce(function(sum, v) {
            return sum + v;
          }, 0) / overallResults.length,
          min: _.min(overallResults),
          max: _.max(overallResults),
        };

        exam.processed = true;

      });

      return fix;
    }
  ])

  ;

})();