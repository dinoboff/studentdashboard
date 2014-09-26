(function() {
  'use strict';

  angular.module(
    'scCoreEducation', [
      'angularFileUpload',
      'ngRoute',
      'scceUpload.directives',
      'scceUser.controllers',
      'scceUser.directives',
      'scCoreEducation.controllers',
      'scCoreEducation.templates',
    ]
  ).

  config(['$routeProvider',
    function($routeProvider) {

      function resolver(meth, userType) {
        return {
          'currentUser': [
            '$location',
            'scceCurrentUserApi',
            function($location, scceCurrentUserApi) {
              return scceCurrentUserApi.auth().then(function(user) {
                if (!user.isLoggedIn || (!user.isStaff && !user.isAdmin)) {
                  $location.path('/error');
                  return;
                }

                return user;
              });
            }
          ],
          'getList': ['scceUsersApi',
            function(scceUsersApi) {
              return scceUsersApi[meth];
            }
          ],
          'initialList': ['$location', 'scceUsersApi',
            function($location, scceUsersApi) {
              return scceUsersApi[meth]().catch(function() {
                $location.path('/error');
              });
            }
          ],
          'userType': function() {
            return userType;
          }
        };
      }

      $routeProvider

      .when('/error', {
        template: '<h1>Error</h1><p>You may need to be part of the staff</p>'
      })

      .when('/users', {
        templateUrl: 'views/sccoreeducation/user-list.html',
        controller: 'ScceUserListCtrl',
        controllerAs: 'ctrl',
        resolve: resolver('all', 'Users')
      })

      .when('/students', {
        templateUrl: 'views/sccoreeducation/student-list.html',
        controller: 'ScceUserListCtrl',
        controllerAs: 'ctrl',
        resolve: resolver('listStudents', 'Students')
      })

      .when('/staff', {
        templateUrl: 'views/sccoreeducation/user-list.html',
        controller: 'ScceUserListCtrl',
        controllerAs: 'ctrl',
        resolve: resolver('staff', 'Staff')
      })

      .otherwise({
        redirectTo: '/users'
      });
    }
  ])

  ;

})();
