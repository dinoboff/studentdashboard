(function() {
  'use strict';

  angular.module(
    'scCoreEducation', [
      'ngRoute',
      'scceUser.controllers',
      'scceUser.directives',
      'scCoreEducation.controllers',
      'scCoreEducation.templates'
    ]
  ).

  config(['$routeProvider',
    function($routeProvider) {

      function resolver(meth, userType) {
        return {
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
        templateUrl: 'views/sccoreeducation/user-list.html',
        controller: 'ScceUserListCtrl',
        controllerAs: 'ctrl',
        resolve: resolver('students', 'Students')
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