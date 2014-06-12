/* jshint bitwise: false*/

(function() {
  'use strict';

  var examId = 1, evaluationId = 1;

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
      portfolio: /\/api\/v1\/dashboard\/portfolio\/([^\/]+)/,
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
      studentUser: {
        isAdmin: false,
        isLoggedIn: true,
        staffId: null,
        logoutUrl: '/logout',
        studentId: 'x1',
        name: 'test@example.com'
      },
      students: {
        'X2010200001': {
          firstName: 'Alice',
          lastName: 'Smith',
          id: 'X2010200001',
          photo: 'http://placehold.it/300x400&text=portrait'
        },
        'X2010200002': {
          firstName: 'Bob',
          lastName: 'Taylor',
          id: 'X2010200002',
          photo: 'http://placehold.it/300x400&text=portrait'
        },
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
          destName = dest.firstName + ' ' + dest.lastName;

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
  })

  ;

})();