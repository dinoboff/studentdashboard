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
(function() {
  'use strict';

  angular.module('scCoreEducation.config', []).

  constant('SCCE_API_BASE', '/api/v1')

  ;
})();
(function() {
  'use strict';

  var interceptor = function(data, operation, what) {
    var resp;

    if (operation !== 'getList') {
      return data;
    }

    if (!data) {
      resp = [];
      resp.cursor = null;
      return resp;
    }

    if (data.type && data[data.type]) {
      resp = data[data.type];
    } else if (data[what]) {
      resp = data[what];
    } else {
      resp = [];
    }

    resp.cursor = data.cursor ? data.cursor : null;
    return resp;
  };

  angular.module('scCoreEducation.services', ['restangular', 'scCoreEducation.config']).

  factory('scceApi', ['Restangular', 'SCCE_API_BASE',
    function(Restangular, SCCE_API_BASE) {
      return {
        client: function(appName) {
          return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(SCCE_API_BASE);
            RestangularConfigurer.addResponseInterceptor(interceptor);
            RestangularConfigurer.setDefaultHeaders({'X-App-Name': appName});
          });
        }
      };
    }
  ])

  ;
})();
(function() {
  'use strict';

  angular.module('scCoreEducation.controllers', []).

  controller('scceNavBarCtrl', ['$scope', '$location',
    function($scope, $location) {

      $scope.isActive = function(route) {
        return route === $location.path();
      };
    }
  ]).

  controller('scceHomeCtrl', ['$scope',
    function($scope) {
      $scope.files = {};
    }
  ])

  ;

})();
(function() {
  'use strict';

  // Keep a reference to scceCurrentUserApi to avoid for the interceptor
  // to avoid a circular dependency.
  //
  // TODO: Create a session service which both scceCurrentUserApi
  // and the the http inceptor can depend on.
  var api;


  angular.module('scceUser.services', ['scCoreEducation.services']).


  provider('scceUserOptions', function scceUserOptionsProvider() {
    this.appName = 'core';
    this.apiClient = null;
    this.defaultReturnUrl = null; // Should return to the current URL.

    this.setAppName = function(name) {
      this.appName = name;
    };

    this.setDefaultUrl = function(url) {
      this.defaultReturnUrl = url;
    };

    this.$get = ['scceApi', function(scceApi) {
      return {
        appName: this.appName,
        apiClient: scceApi.client(this.appName),
        defaultReturnUrl: this.defaultReturnUrl
      };
    }];
  }).

  /**
   * scceCurrentUserApi - api to access user info.
   *
   * scceCurrentUserApi.get(returnUrl)  Return the user name, id and the
   * the logout url if the user logged in. Return the login url if the
   * user logged off.
   *
   * Note that it returns a promise that resole in either case. If the promise
   * fails, there was either a problem with the optional return url, or
   * there's an unexpected issue with the backend.
   *
   * TODO: handle lose of authentication.
   *
   */
  factory('scceCurrentUserApi', ['$location', '$q', 'scceUserOptions',
    function($location, $q, scceUserOptions) {
      var client = scceUserOptions.apiClient;

      api = {
        info: null,
        loading: null,

        _get: function(returnUrl) {
          var params = {
            returnUrl: (
              returnUrl ||
              scceUserOptions.defaultReturnUrl ||
              $location.absUrl()
            )
          };

          return client.one('user').get(params).then(function(data) {
            return data;
          });
        },

        auth: function(returnUrl) {

          if (api.info) {
            return $q.when(api.info);
          }

          if (api.loading) {
            return api.loading;
          }


          api.loading = api._get(returnUrl).then(function(user) {
            api.info = user;
            return user;
          })['finally'](function() {
            api.loading = null;
          });

          return api.loading;
        },

        reset: function(loginUrl, msg) {
          var currentLoginUrl = api.info && api.info.loginUrl || null;

          loginUrl = loginUrl || currentLoginUrl;
          if (loginUrl) {
            api.info = {loginUrl: loginUrl, error: msg};
          } else {
            api.info = null;
          }
        }
      };

      return api;
    }
  ]).

  /**
   * Api to query users.
   *
   * scceUsersApi.users, scceUsersApi.students and scceUsersApi.staff
   * return promises that resolve to list of user.
   *
   * makeStaff sends a request make a user a member of staff.
   *
   * TODO: add support to revoke staff.
   */
  factory('scceUsersApi', ['scceUserOptions',
    function(scceUserOptions) {
      var client = scceUserOptions.apiClient;

      return {

        all: function(cursor) {
          var params = {};

          if (cursor) {
            params.cursor = cursor;
          }
          return client.all('users').getList(params);
        },

        getById: function(userId) {
          return client.one('users', userId).get();
        },

        students: function(cursor) {
          var params = {};

          if (cursor) {
            params.cursor = cursor;
          }
          return client.all('students').getList(params);
        },

        staff: function(cursor) {
          var params = {};

          if (cursor) {
            params.cursor = cursor;
          }
          return client.all('staff').getList(params);
        },

        makeStaff: function(user) {
          return client.one('staff', user.id).put();
        }
      };
    }
  ]).

  /**
   * Intercept http response error to reset scceCurrentUserApi on http
   * 401 response.
   *
   */
  factory('scceCurrentHttpInterceptor', ['$q', '$location',
    function($q, $location) {
      var httpPattern = /https?:\/\//,
        thisDomainPattern = new RegExp(
          'https?://' + $location.host().replace('.', '\\.')
        );

      function isSameDomain(url) {
        return !httpPattern.test(url) || thisDomainPattern.test(url);
      }

      return {
        responseError: function(resp) {
          if (
            api &&
            resp.status === 401 &&
            isSameDomain(resp.config.url)
          ) {
            api.reset(resp.data.loginUrl, resp.data.error);
          }

          return $q.reject(resp);
        }
      };
    }
  ]).

  config(['$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('scceCurrentHttpInterceptor');
    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module(
    'scceUser.directives', ['scceUser.services', 'scCoreEducation.templates']
  ).

  /**
   * Directive creating a login info link for a boostrap navbar
   */
  directive('scceUserLogin', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/sccoreeducation/user/login.html',
      scope: {},
      controller: ['$scope', 'scceCurrentUserApi',
        function($scope, scceCurrentUserApi) {
          $scope.user = scceCurrentUserApi;
          scceCurrentUserApi.auth();
        }
      ]
    };
  });

})();
(function() {
  'use strict';

  angular.module('scceUser.controllers', []).

  controller('ScceUserListCtrl', ['$q', 'scceUsersApi', 'getList', 'initialList', 'userType',
    function($q, scceUsersApi, getList, initialList, userType) {
      var self = this;

      this.users = initialList;
      this.userType = userType;
      this.loading = null;

      this.updateUserList = function() {
        this.loading = $q.when(this.loading).then(function(){
          return getList();
        }).then(function(users){
          self.users = users;
          self.loading = null;
          return users;
        });

        return this.loading;
      };

      this.getMore = function() {
        if (!this.users || !this.users.cursor) {
          return $q.when([]);
        }

        this.loading = $q.when(this.loading).then(function(){
          return getList(this.users.cursor);
        }).then(function(users){
          self.users = self.users.concat(users);
          self.users.cursor = users.cursor;
          self.loading = null;
          return users;
        });

        return this.loading;
      };

      this.makeStaff = function(user) {
        user.isStaff = true;
        scceUsersApi.makeStaff(user).catch(function() {
          user.isStaff = false;
        });
      };

      this.revokeStaff = function(user) {
        // TODO
        console.dir(user);
      };
    }
  ])


  ;

})();
(function() {
  'use strict';

  angular.module('scceSvg.directives', []).

  /**
   * Directive to set the a `svg element `viewBox` attribute
   * and keep it responsive.
   *
   * With:
   *
   *  <svg ng-attr-viewBox="0 0 {{100}} {{100}}"/>
   *
   * Angular would produce the correct attribute but it would have no effect.
   * This directive edit the viewBox.baseVal property directly.
   *
   * Usage:
   *
   *   <scce-svg-container scce-viewbox="layout">
   *     <svg/>
   *   </scce-svg-container>
   *
   * where `$scope.layout == {width: 100, height: 100, margin:{top:10, left:20}}`
   *
   */
  directive('scceSvgContainer', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        'viewBox': '=?scceViewbox'
      },
      template: '<div ng-transclude ng-style="container"></div>',
      link: function(scope, element) {
        var svg = element.find('svg');

        // Set css of the svg wrapper
        scope.container = {
          'display': 'inline-block',
          'position': 'relative',
          'width': '100%',
          'padding-bottom': '100%',
          'vertical-align': 'middle',
          'overflow': 'hidden'
        };

        // set css and attribute of the svg element
        svg.css({
          'display': 'inline-block',
          'position': 'absolute',
          'top': '0',
          'left': '0'
        });


        svg.get(0).setAttribute(
          'preserveAspectRatio', 'xMinYMin meet'
        );

        scope.$watch('viewBox', function() {
          var vb = scope.viewBox, ratio;

          if (!vb || !vb.height || !vb.width || !vb.margin) {
            return;
          }

          ratio = vb.height / vb.width;

          // set / update svg view port
          svg.get(0).setAttribute(
            'viewBox', [-vb.margin.left, -vb.margin.top, vb.width, vb.height].join(' ')
          );

          // adjust position of the svg element in the wrapper
          scope.container['padding-bottom'] = (ratio * 100) + '%';
        });
      }
    };
  })


  ;

})();
(function() {
  'use strict';

  angular.module('scceSvg.services', []).

  /**
   * Return a Layout object constructor.
   *
   * A Layout object has the following properties:
   * - `width` and `height`, to represent the svg total width and height
   * - `margin`, to represent the dimensions of the margin around the main
   * svg feature. For a chart it would contain the scales, legend, titles,
   * etc...
   * - `innerWdith` and `innerHeight` to represent the dimensions of the svg
   * main feature.
   *
   * ScceLayout includes 2 method to build the layout from
   * the content size (`ScceLayout.contentSizing`) or from the
   * box size (`ScceLayout.boxSizing`).
   *
   */
  factory('ScceLayout', ['$window',
    function($window) {
      var _ = $window._;

      function Layout(opts) {
        opts = opts || {};

        _.defaults(opts, {
          width: 400,
          height: 300,
          margin: {}
        });

        _.defaults(opts.margin, {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
        });

        _.assign(this, opts);

        // Calculate inner height and width
        this.innerHeight = this.height - this.margin.top - this.margin.bottom;
        this.innerWidth = this.width - this.margin.right - this.margin.left;
      }

      Layout.contentSizing = function(opts) {
        opts = opts || {};

        _.defaults(opts, {
          innerWidth: 400,
          innerHeight: 300,
          margin: {}
        });

        _.defaults(opts.margin, {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
        });

        return new Layout({
          height: opts.innerHeight + opts.margin.top + opts.margin.bottom,
          width: opts.innerWidth + opts.margin.right + opts.margin.left,
          margin: opts.margin
        });
      };

      Layout.boxSizing = function(opts) {
        return new Layout(opts);
      };

      return Layout;
    }
  ])


  ;

})();
(function() {
  'use strict';


  angular.module('scceStaff.services', ['scCoreEducation.services']).

  factory('scceStaffApi', ['scceUsersApi',
    function(scceUsersApi) {
      return {
        all: function() {
          console.log('Deprecated... Use scceUsersApi.students() instead');
          return scceUsersApi.students();
        },
        add: function(userId) {
          console.log(
            'Deprecated... Use scceUsersApi.makeStaff({id:userID}) instead'
          );
          return scceUsersApi.makeStaff({
            id: userId
          });
        }
      };
    }
  ])

  ;

})();
(function() {
  'use strict';


  angular.module('scceStudents.services', ['scCoreEducation.services']).

  factory('scceStudentsApi', ['scceUsersApi',
    function(scceUsersApi) {
      return {
        all: function() {
          console.log('Deprecated... Use scceUsersApi.students() instead');
          return scceUsersApi.students();
        }
      };
    }
  ])

  ;

})();