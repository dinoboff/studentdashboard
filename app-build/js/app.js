(function() {
  'use strict';

  angular.module('scDashboard', ['ngRoute', 'scDashboard.controllers', 'scdRepository.controllers']).

  config(['$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/scdashboard/repository.html',
          controller: 'scdRepositoryList'
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

  angular.module('scDashboard.services', ['restangular', 'scDashboard.config']).

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

  angular.module('scDashboard.controllers', ['scecUser.services']).

  controller('scdNavBarCtrl', ['$scope', '$location', 'scecCurrentUserApi',
    function($scope, $location, currentUserApi) {

      $scope.activeUser = null;
      $scope.login = currentUserApi.get('/').then(function(info) {
        $scope.activeUser = info;
        return info;
      });

      $scope.isActive = function(route) {
        return route === $location.path();
      };
    }
  ]).

  controller('scdHomeCtrl', ['$scope',
    function($scope) {
      $scope.files = {};
    }
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
        }
      };
    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scdRepository.controllers', ['scdRepository.services', 'scecStudents.services', 'scecUser.services']).

  controller('scdRepositoryList', ['$scope', 'scdRepositoryApi', 'scecStudentsApi', 'scecCurrentUserApi',
    function($scope, scdRepositoryApi, scecStudentsApi, scecCurrentUserApi) {

      scecCurrentUserApi.get().then(function(user) {
        if (user.error) {
          $scope.error = 'You need to be logged to list a repository';
          $scope.files = [];
          return;
        }
        if (!user.isStaff && !user.isAdmin) {
          return $scope.listFile(user.id);
        }

        $scope.displayStudentsSelect = true;
        listStudent();
        $scope.files = [];
        return $scope.files;
      });


      $scope.students = null;
      $scope.displayStudentsSelect = false;
      function listStudent() {
        return scecStudentsApi.all().then(function(studentList) {
          $scope.students = studentList;
        });
      }

      $scope.files = null;
      $scope.listFile = function(studentId) {
        $scope.files = null;
        scdRepositoryApi.getRepositoryById(studentId).then(function(list) {
          $scope.files = list;
        }).catch(function(resp) {
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
  ])

  ;

})();