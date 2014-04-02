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

  angular.module('scDashboard.services', ['restangular', 'scDashboard.config', 'scecUser.services']).

  service('scdDashboardApi', ['Restangular', 'SCD_API_BASE',
    function(Restangular, SCD_API_BASE) {
      return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl(SCD_API_BASE);
        RestangularConfigurer.addResponseInterceptor(interceptor);
      });
    }
  ]).

  service('scdDashboardUserApi', ['scecCurrentUserApi', '$q',
    function(scecCurrentUserApi, $q) {
      var user = {
        currentUser: null,
        _currentPromise: null,
        get: function(returnUrl) {
          if (user.currentUser) {
            return $q.when(user.currentUser);
          }

          if (user._currentPromise) {
            return user._currentPromise;
          }

          user._currentPromise = scecCurrentUserApi.get(returnUrl).then(function(data) {
            user.currentUser = data;
            return data;
          });

          return user._currentPromise;
        }
      };

      return user;
    }
  ])

  ;

})();