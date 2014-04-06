(function() {
  'use strict';

  angular.module('scDashboard', ['ngRoute', 'scDashboard.controllers', 'scdRepository.controllers']).

  config(['$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/scdashboard/repository.html',
          controller: 'scdRepositoryListCtrl'
        })
        .otherwise({
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

  angular.module('scDashboard.controllers', ['scDashboard.services', 'scceUser.directives']).

  controller('scdNavBarCtrl', ['$scope', '$location',
    function($scope, $location) {
      $scope.isActive = function(route) {
        return route === $location.path();
      };
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