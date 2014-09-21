(function() {
  'use strict';


  angular.module('scdChart.directives', [
    'scceSvg.directives',
    'scdMisc.filters'
  ]).

  /**
   * Meter directive
   *
   * Usage:
   *
   *   <scd-chart-meter
   *     scd-layout="layout"
   *     scd-levels="levels"
   *     scd-reading="reading"
   *   ></scd-chart-meter>
   *
   * Where:
   *
   * - layout would be an layout object
   *   (width, height and magin attribute)
   * - levels would be an array of levels for the meter
   *   eg: [{id: 'danger', min: 0, max: 60}, {id: 'ok', max: 100}]
   * - reading would and object with value, unit and label properties.
   *   eg: {unit: '%', label: "Perecentage Completed", value: 65}
   */
  directive('scdChartMeter', [
    '$window',
    function scdChartMeterFactory($window) {
      var d3 = $window.d3,
        _ = $window._;

      function arc(radius) {
        return d3.svg.arc()
          .startAngle(function(d) {
            return d.startAngle;
          })
          .endAngle(function(d) {
            return d.endAngle;
          })
          .innerRadius(radius.inner || 0)
          .outerRadius(radius.outer);
      }

      return {
        templateUrl: 'views/scdashboard/charts/meter.html',
        restrict: 'E',
        scope: {
          'layout': '=scdLayout',
          'donutWidth': '&scdDonut',
          'levels': '=scdLevels',
          'reading': '=scdReading'
        },
        // arguments: scope, iElement, iAttrs, controller
        link: function scdChartMeterPostLink(scope) {
          scope.scales = {
            degres: null
          };

          function setScales() {
            var min, max;

            scope.scales.degres = d3.scale.linear();
            if (!scope.layout || !scope.levels) {
              return;
            }

            min = scope.levels[0].min;
            max = scope.levels.slice(-1).pop().max;
            scope.scales.degres.domain([min, max]);
            scope.scales.degres.range([0, 180]);
          }


          scope.radius = {};
          scope.levelArc = angular.noop;

          function setRadius() {
            var donutWidth = scope.donutWidth() || 15;

            scope.radius = {};
            if (!scope.layout) {
              return;
            }

            scope.radius.outer = scope.layout.innerWidth / 2;
            if (scope.radius.outer > scope.layout.innerHeight) {
              scope.radius.outer = scope.layout.innerHeight;
            }

            scope.radius.inner = scope.radius.outer - donutWidth;
            scope.levelArc = arc(scope.radius);
          }

          scope.levelSlices = [];

          function setLevelSlices() {
            var slicesData;

            scope.levelSlices = [];
            if (scope.levels.length < 1) {
              return;
            }

            slicesData = _.reduce(scope.levels, function(data, level) {
              if (level.min === undefined) {
                level.min = data.slice(-1).pop().max;
              }

              data.push({
                id: level.id,
                label: level.label || level.id,
                value: level.max - level.min,
                max: level.max
              });

              return data;
            }, []);

            scope.levelSlices = d3.layout.pie().sort(null).value(function(d) {
              return d.value;
            }).startAngle(-Math.PI / 2).endAngle(Math.PI / 2)(slicesData);
          }

          scope.$watch('layout', setRadius);
          scope.$watch('layout', setScales);
          scope.$watch('levels', setScales);
          scope.$watch('levels', setLevelSlices);
        }
      };
    }
  ])

  ;

})();
