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