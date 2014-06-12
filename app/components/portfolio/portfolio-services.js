(function() {
  'use strict';

  angular.module('scdPortFolio.services', ['scDashboard.services']).

  factory('scdPorfolioApi', ['scdDashboardApi',
    function(dashboardApi) {
      return {
        getById: function(studentId) {
          return dashboardApi.all('portfolio').get(studentId);
        }
      };
    }
  ]).

  factory('scdPfSvgLayout', [
    function() {
      return function(margin, width, height) {
        margin = margin || {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        };
        width = width || 600;
        height = height || 450;

        return {
          margin: margin,
          width: width,
          height: height,
          innerWidth: width - margin.right - margin.left,
          innerHeight: height - margin.top - margin.bottom
        };

      };
    }
  ])

  ;

})();