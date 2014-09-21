(function() {
  'use strict';


  angular.module('scdChart.directives', [
    'scceSvg.directives',
    'scdMisc.filters'
  ]).

  service('scdArc', ['$window',
    function scdArcFactory($window) {
      var d3 = $window.d3;

      return function scdArc(radius) {
        return d3.svg.arc()
          .startAngle(function(d) {
            return d.startAngle;
          })
          .endAngle(function(d) {
            return d.endAngle;
          })
          .innerRadius(radius.inner || 0)
          .outerRadius(radius.outer);
      };
    }
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
    'scdArc',
    function scdChartMeterFactory($window, scdArc) {
      var d3 = $window.d3,
        _ = $window._;

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
            scope.levelArc = scdArc(scope.radius);
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
  ]).

  /**
   * scdChartComponents
   *
   * Usage:
   *
   *    <scd-chart-components
   *      scd-layout="layout"
   *      scd-main-data="main"
   *      scd-components="components"
   *     >
   *     </scd-chart-components>
   *
   * Where:
   * - main would be the main stats to show (with label, unit and value
   *   attribute)
   * - components should decompose the main stats. It would be array of object
   *   with id, label and value attribute.
   *
   */
  directive('scdChartComponents', [
    '$window',
    'scdArc',
    function scdChartComponentsFactory($window, scdArc) {
      var d3 = $window.d3;

      function shifterFactory(arc) {
        return function shifter(slice, margin) {
          var c = arc.centroid(slice),
            x = c[0],
            y = c[1],
            h = Math.sqrt(x * x + y * y);

          return 'translate(' +
            (x / h * margin) + ',' +
            (y / h * margin) +
            ')';
        };
      }

      return {
        templateUrl: 'views/scdashboard/charts/components.html',
        restrict: 'E',
        scope: {
          'layout': '=scdLayout',
          'mainData': '=scdMainData',
          'components': '=scdComponents'
        },
        // arguments: scope, iElement, iAttrs, controller
        link: function scdChartComponentsPostLink(scope) {

          function setHelpers() {
            var radius = {},
              labelMargin;

            scope.arc = scope.shiftSlice = angular.noop;
            scope.shiftLabel = scope.onLeftCenter = angular.noop;
            if (!scope.layout) {
              return;
            }

            if (scope.layout.innerWidth > scope.layout.innerHeight) {
              radius.outer = scope.layout.innerHeight / 2;
            } else {
              radius.outer = scope.layout.innerWidth / 2;
            }

            scope.arc = scdArc(radius);
            scope.shiftSlice = shifterFactory(scope.arc);

            labelMargin = radius.outer + scope.layout.margin.top / 2;
            scope.shiftLabel = function shiftLabel(slice, margin) {
              margin = (margin || 0) + labelMargin;

              return scope.shiftSlice(slice, margin);
            };

            scope.onLeftCenter = function onLeftCenter(slice) {
              return (slice.endAngle + slice.startAngle) / 2 > Math.PI;
            };

          }

          function setSlices() {
            scope.slices = [];
            if (!scope.components) {
              return;
            }

            scope.slices = d3.layout.pie().sort(null).value(function(d) {
              return d.value;
            })(scope.components);
          }

          scope.$watch('layout', setHelpers);
          scope.$watch('components', setSlices);
        }
      };
    }
  ])

  ;

})();
