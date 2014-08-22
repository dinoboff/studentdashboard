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
        examId = 1,
        evaluationId = 1,
        fix;

      function getRandomArbitary(min, max) {
        return window.Math.random() * (max - min) + min;
      }

      fix = {
        urls: {
          login: /\/api\/v1\/user/,
          portfolio: /\/api\/v1\/dashboard\/portfolio\/([^\/]+)$/,
          portfolioExam: /\/api\/v1\/dashboard\/portfolio\/([^\/]+)\/exam\/([^\/]+)$/,
          portfolioEvaluation: /\/api\/v1\/dashboard\/portfolio\/([^\/]+)\/evaluation\/([^\/]+)$/,
          students: '/api/v1/students',
          studentFiles: /\/api\/v1\/dashboard\/repository\/([^\/]+)\/files/,
          uploadUrl: /api\/v1\/dashboard\/repository\/([^\/]+)\/uploadurl/,
          upload: /_ah\/upload\/(.*)/
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
            }
          },
          exams: {
            '1': {
              id: '1',
              name: 'Some Exam Preparation',
              exams: [{
                name: 'External Exam 1',
                id: examId++
              }, {
                name: 'External Exam 2',
                id: examId++
              }, {
                name: 'External Exam 3',
                id: examId++
              }, {
                name: 'External Exam 4',
                id: examId++
              }]
            },
            '2': {
              id: '2',
              name: 'Another Exam Preparation',
              exams: [{
                name: 'Another Data Results 1',
                id: examId++
              }, {
                name: 'Another Data Results 2',
                id: examId++
              }, {
                name: 'Another Data Results 3',
                id: examId++
              }, {
                name: 'Another Data Results 4',
                id: examId++
              }]
            },
            '3': {
              id: '3',
              name: 'Performance Exams',
              exams: [{
                name: 'CP 1',
                id: examId++
              }, {
                name: 'CP 2',
                id: examId++
              }]
            },
            '4': {
              id: '4',
              name: 'AAA Exams',
              exams: [{
                name: 'Area 1',
                id: examId++
              }, {
                name: 'Area 2',
                id: examId++
              }, {
                name: 'Area 3',
                id: examId++
              }, {
                name: 'Area 4',
                id: examId++
              }, {
                name: 'Area 5',
                id: examId++
              }, {
                name: 'Area 6',
                id: examId++
              }]
            }
          },
          examResults: {},
          evaluations: {
            'evs1': {
              id: 'evs1',
              name: 'TBD Evaluations',
              evaluations: [ // Should be an object (id -> evaluation)
                {
                  name: 'Evaluation 1',
                  id: evaluationId++
                }, {
                  name: 'Evaluation 2',
                  id: evaluationId++
                }, {
                  name: 'Evaluation 3',
                  id: evaluationId++
                }, {
                  name: 'Evaluation 4',
                  id: evaluationId++
                }, {
                  name: 'Evaluation 5',
                  id: evaluationId++
                }
              ]
            }
          },
          evaluationResults: {},
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
          evaluationFields: {
            't1': 'History Taking Skills',
            't2': 'Physical Examination Skills',
            't3': 'Analytical Skills',
            't4': 'Communication Skills',
            't5': 'Medical Knowledge',
            't6': 'Management Skills',
          },
          evaluationTypeResult: [
            'Do Not Meet',
            'Occasionally Meet',
            'Consistently Meet',
            'Occasionally Exceeds',
            'Consistently Exceeds'
          ],
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

      // Build random result for each exam.
      _.forEach(fix.data.exams, function(series) {
        _.forEach(series.exams, function(exam) {
          var fieldId = 1;

          fix.data.examResults[exam.id] = {
            id: exam.id,
            name: exam.name,
            series: {
              id: series.id,
              name: series.name
            },
            results: {}
          };

          _.forEach(fix.data.examFields, function(name) {
            var min = getRandomArbitary(-1.8, -0.3),
              max = getRandomArbitary(0.3, 1.9),
              mean = getRandomArbitary(min, max),
              field = {
                name: name,
                id: fieldId++
              };

            fix.data.examResults[exam.id].results[field.id] = {
              topic: field,
              data: {
                max: max,
                min: min,
                mean: mean
              }
            };
          });
        });
      });

      // Build random result for each evaluation.
      _.forEach(fix.data.evaluations, function(series) {
        series.evaluations.forEach(function(ev) {
          var evaluation = fix.data.evaluationResults[ev.id] = _.clone(ev);

          evaluation.series = {
            id: series.id,
            name: series.name
          };
          evaluation.results = {};

          _.forEach(fix.data.evaluationFields, function(topicName, topicId) {
            var topic = evaluation.results[topicId] = {
              topic: {
                id: topicId,
                name: topicName
              }
            };

            topic.data = fix.data.evaluationTypeResult.map(function(name) {
              return {
                name: name,
                value: getRandomArbitary(0, 1),
                mean: getRandomArbitary(0, 1)
              };
            });

          });

        });
      });

      return fix;
    }
  ])

  ;

})();