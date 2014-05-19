(function() {
  'use strict';

  angular.module('scDashboard', [
    'ngRoute',
    'scDashboard.controllers',
    'scdRepository.controllers',
    'scdReview.controllers'
  ]).

  config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.

        when('/', {
          templateUrl: 'views/scdashboard/repository.html',
          controller: 'scdRepositoryListCtrl'
        }).

        when('/review', {
          templateUrl: 'views/scdashboard/review.html',
          controller: 'scdReviewCtrl'
        }).

        otherwise({
          redirectTo: '/'
        });

    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scDashboard.config', []).

  constant('SCD_API_BASE', '/api/v1/dashboard')

  ;

})();
(function() {
  'use strict';

  var interceptor = function(data, operation, what) {
    var resp;

    if (operation === 'getList') {
      resp = data[what] ? data[what] : [];
      resp.cursor = data.cursor ? data.cursor : null;
    } else {
      resp = data;
    }
    return resp;
  };

  angular.module('scDashboard.services', ['restangular', 'scDashboard.config', 'scceUser.services']).

  service('scdDashboardApi', ['Restangular', 'SCD_API_BASE',
    function(Restangular, SCD_API_BASE) {
      return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl(SCD_API_BASE);
        RestangularConfigurer.addResponseInterceptor(interceptor);
      });
    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scDashboard.controllers', [
    'scceUser.directives',
    'scceUser.services',
    'scDashboard.services'
  ]).

  controller('scdNavBarCtrl', ['$scope', '$location', 'scceCurrentUserApi',
    function($scope, $location, currentUserApi) {
      $scope.currentUser = null;

      $scope.isActive = function(route) {
        return route === $location.path();
      };

      currentUserApi.auth().then(function(user) {
        $scope.currentUser = user;
      });
    }
  ]).

  controller('scdHomeCtrl', ['$scope',

  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scdRepository.services', ['scDashboard.services']).

  factory('scdRepositoryApi', ['scdDashboardApi',
    function(scdDashboardApi) {
      return {
        getRepositoryById: function(studentId) {
          return scdDashboardApi.one('repository', studentId).all('files').getList();
        },
        newUploadUrl: function(studentId) {
          return scdDashboardApi.one('repository', studentId).one('uploadurl').post();
        }
      };
    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module(
    'scdRepository.controllers', [
      'scdRepository.services',
      'scceStudents.services',
      'scceUser.services',
      'scDashboard.services',
      'angularFileUpload',
      'scdRepository.directives'
    ]
  ).

  controller('scdRepositoryListCtrl', ['$scope', 'scdRepositoryApi', 'scceStudentsApi', 'scceCurrentUserApi', '$q',
    function($scope, scdRepositoryApi, scceStudentsApi, scceCurrentUserApi, $q) {
      $scope.currentUser = null;
      $scope.files = null;
      $scope.showStudentSelector = false;
      $scope.selected = {};
      $scope.students = null;

      scceCurrentUserApi.auth().then(function(user) {
        if (user.error) {
          $scope.error = 'You need to be logged to list a repository';
          $scope.files = [];
          return $q.reject('You need to be logged to list a repository');
        }

        $scope.currentUser = user;
        if (!user.staffId && !user.isAdmin) {
          $scope.listFile(user.id);
          return user;
        }

        $scope.showStudentSelector = true;
        $scope.files = [];
        listStudent();
        return user;
      });

      function listStudent() {
        return scceStudentsApi.all().then(function(studentList) {
          $scope.students = studentList;
        });
      }

      $scope.listFile = function(studentId) {
        if (!studentId) {
          $scope.files = [];
          return $q.reject('You need to select a student.');
        }

        $scope.files = null;
        return scdRepositoryApi.getRepositoryById(studentId).then(function(list) {
          $scope.files = list;
          return list;
        }).catch (function(resp) {
          if (resp.status === 401) {
            $scope.error = 'You need to be logged to list a repository';
          } else if (resp.status === 403) {
            $scope.error = 'Only admin or staff can list the files of a student.';
          } else {
            $scope.error = 'Unexpected error while trying to fetch the file list';
          }
        });
      };
    }
  ]).

  controller('scdRepositoryUploadFileCtrl', ['$scope', '$upload', 'scdRepositoryApi',
    function($scope,$upload, scdRepositoryApi) {
      $scope.docTypes = ['SHELF', 'USMLE', 'Peer Evaluations'];

      function onProgress(evt) {
        $scope.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      }

      function onSucess(data) {
        $scope.files.unshift(data);
        $scope.success = 'New file uploaded.';
        $scope.selected.file = null;
        $scope.reset();
      }

      function uploadFile(file) {
        scdRepositoryApi.newUploadUrl($scope.selected.student.id).then(function(uploadInfo) {
          $scope.upload = $upload.upload({
            url: uploadInfo.url,
            method: 'POST',
            withCredentials: true,
            data: {
              name: $scope.fileMeta.name || file.name,
              docType: $scope.fileMeta.docType,
              destId: $scope.selected.student.id
            },
            file: file
          }).progress(
            onProgress
          ).success(
            onSucess
          );
        });

      }

      $scope.reset = function() {
        $scope.fileMeta = {};
        $scope.selected.file = null;
        $scope.showProgress = false;
        $scope.progress = 0;
      };

      $scope.onFileSelect = function(file) {
        $scope.fileMeta.name = file.name;
      };

      $scope.uploadButtonClicked = function(file) {
        uploadFile(file);
        $scope.showProgress = true;
      };

      $scope.reset();
    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scdRepository.directives', []).


  directive('scdFile', ['$parse',
    function($parse) {
      return {
        link: function($scope, elem, attr) {
          var onSelect = $parse(attr.scdSelected),
            fileSetter = $parse(attr.scdFile).assign;

          elem.bind('change', function(evt) {
            var files = [],
              fileList, i;

            fileList = evt.target.files;
            if (fileList !== null) {
              for (i = 0; i < fileList.length; i++) {
                files.push(fileList.item(i));
              }
            }

            fileSetter($scope, files.length > 0 ? files[0] : null);
            onSelect($scope);
            $scope.$digest();
          });

          elem.bind('click', function() {
            this.value = null;
          });

          $scope.$watch(attr.scdFile, function(newVal) {
            if (!newVal) {
              elem.get(0).value = null;
            }
          });
        }
      };
    }
  ])

  ;

})();
(function() {
  'use strict';

  var data = {
    review: {
      average: {
        'All residents': {
          'All Categories': 70,
          'Traumatic Disorders': 71,
          'Cardiovascular Disorders': 69
        },
        'PGY 1': {
          'All Categories': 69,
          'Traumatic Disorders': 70,
          'Cardiovascular Disorders': 68
        },
        'PGY 2': {
          'All Categories': 71,
          'Traumatic Disorders': 72,
          'Cardiovascular Disorders': 70
        }
      },
      students: [{
        'id': 'x1',
        'firstName': 'Alice',
        'lastName': 'Smith',
        'PGY': 2,
        'All Categories': 71,
        'Traumatic Disorders': 72,
        'Cardiovascular Disorders': 70
      }, {
        'id': 'x2',
        'firstName': 'Bob',
        'lastName': 'Taylor',
        'PGY': 1,
        'All Categories': 69,
        'Traumatic Disorders': 70,
        'Cardiovascular Disorders': 68
      }]
    },
    prev: '',
    next: ''
  };

  function layout(innerHeight, margin, width) {
    margin = margin || {top: 10, right: 50, bottom:10, left: 150};
    width = width || 900;

    return {
      margin: margin,
      width: width,
      height: innerHeight + margin.top + margin.bottom,
      innerWidth: width - margin.right - margin.left,
      innerHeight: innerHeight
    };

  }

  function ReviewCtrl($scope, window) {
    this._ = window._;
    this.d3 = window.d3;
    this.scope = $scope;

    $scope.residents = [
      'All residents',
      'PGY 1',
      'PGY 2'
    ];
    $scope.categories = [
      'All Categories',
      'Traumatic Disorders',
      'Cardiovascular Disorders'
    ];
    $scope.filters = {
      category: $scope.categories[0],
      resident: $scope.residents[0]
    };
    $scope.layout = layout(data.review.students.length * 20); // 20px per student

    $scope.setResident = this.filterData.bind(this);

    this.filterData();
    this.setScales();
  }


  ReviewCtrl.prototype.setScales = function() {
    var self = this;

    if (!this.scope.scales) {
      this.scope.scales = {
        x: this.d3.scale.linear().domain(
          [0, 100]
        ).range(
          [0, this.scope.layout.innerWidth]
        )
      };
    }

    this.scope.scales.y = this.d3.scale.ordinal();
    this.scope.review.students.forEach(function(student) {
      student.fullName = student.firstName + ' ' + student.lastName;
      self.scope.scales.y(student.id);
    });
    this.scope.scales.y = this.scope.scales.y.rangePoints([this.scope.layout.innerHeight, 0], 1);
  };


  ReviewCtrl.prototype.filterData = function() {
    var target;

    if (
      !this.scope.filters ||
      !this.scope.filters.resident ||
      this.scope.filters.resident.length <= 4 ||
      this.scope.filters.resident === 'All residents'
    ) {
      this.scope.review = data.review;
      this.setLayout();
      return;
    } else {
      target = this.scope.filters.resident;
    }

    this.scope.review = this._.clone(data.review);
    this.scope.review.students = this._.filter(data.review.students, function(s){
      return s.PGY === parseInt(target[4], 10);
    });
    this.setLayout();
  };


  ReviewCtrl.prototype.setLayout = function() {
    this.scope.layout = layout(this.scope.review.students.length * 20); // 20px per student
  };


  angular.module('scdReview.controllers', ['scceSvg.directives']).

  controller('scdReviewCtrl', ['$scope', '$window', ReviewCtrl])

  ;

})();