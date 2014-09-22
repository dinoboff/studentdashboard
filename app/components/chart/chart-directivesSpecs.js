/* jshint camelcase: false*/
/* global describe, beforeEach, module, it, inject, expect */

(function() {
  'use strict';

  describe('scdChart.directives', function() {
    var compile, scope, elem, Layout, _;

    beforeEach(module(
      'scdChart.directives',
      'scceSvg.services',
      'views/scdashboard/charts/meter.html',
      'views/scdashboard/charts/components.html',
      'views/scdashboard/charts/history.html'
    ));

    beforeEach(inject(function(_$compile_, _$rootScope_, ScceLayout, $window) {
      compile = _$compile_;
      scope = _$rootScope_;
      Layout = ScceLayout;
      _ = $window._;
    }));


    describe('scdChartMeter', function() {

      beforeEach(function() {
        elem = compile([
          '<scd-chart-meter',
          '  scd-layout="layout"',
          '  scd-donut="15"',
          '  scd-levels="steps"',
          '  scd-reading="score"',
          '>',
          '</scd-chart-meter>'
        ].join(''))(scope);
      });

      it('Should setup scope', function() {
        var isolatedScope;

        scope.layout = Layout.contentSizing({
          innerWidth: 100,
          innerHeight: 50
        });
        scope.steps = [{
          min: -50,
          max: 0,
          id: 'danger'
        }, {
          max: 10,
          id: 'warning'
        }, {
          max: 50,
          id: 'ok'
        }];
        scope.score = {
          value: 0,
          unit: '%',
          label: 'Probability of Passing'
        };

        scope.$apply();
        isolatedScope = elem.isolateScope();
        expect(isolatedScope.radius).toEqual({
          inner: 35,
          outer: 50
        });

        expect(isolatedScope.scales.degres(-50)).toBe(0);
        expect(isolatedScope.scales.degres(0)).toBe(90);
        expect(isolatedScope.scales.degres(50)).toBe(180);
        expect(isolatedScope.scales.degres.ticks(10)).toEqual(_.range(-50, 60, 10));
        expect(isolatedScope.scales.degres.ticks(3)).toEqual(_.range(-50, 100, 50));

        expect(isolatedScope.levelSlices.map(function(slice) {
          return slice.value;
        })).toEqual([50, 10, 40]);
      });

    });


    describe('scdChartComponents', function() {

      beforeEach(function() {
        elem = compile([
          '<scd-chart-components',
          '  scd-layout="layout"',
          '  scd-main-data="main"',
          '  scd-components="components"',
          '>',
          '</scd-chart-components>'
        ].join(''))(scope);
      });

      it('should set the layout and slices properties', function() {
        var isolatedScope;

        scope.layout = Layout.contentSizing({
          innerWidth: 100,
          innerHeight: 100
        });

        scope.main = {
          title: 'Progress',
          subTitle: 'Percentage completed',
          value: '75',
          unit: '%'
        };

        scope.components = [{
          label: 'Correct',
          value: 50,
          id: 'correct'
        }, {
          label: 'Incorrect',
          value: 25,
          id: 'incorrect'
        }, {
          label: 'Unattempted',
          value: 25,
          id: 'unattempted'
        }];

        scope.$apply();
        isolatedScope = elem.isolateScope();

        expect(isolatedScope.slices).toBeDefined();
        expect(isolatedScope.shiftLabel).toBeDefined();
        expect(isolatedScope.arc).toBeDefined();
        expect(isolatedScope.onLeftCenter).toBeDefined();
        expect(isolatedScope.shiftSlice).toBeDefined();
      });

    });

    /**
     * Show the progression of a stats over time.
     *
     * usage:
     *
     *    <scd-chart-history
     *      scd-layout="layout"
     *      scd-series="series"
     *      scd-ref="ref"
     *      scd-current="current"
     *      scd-options="options"
     *      scd-legend="legend"
     *     >
     *    </scd-chart-history>
     *
     * Where:
     * - `series` should be an array of object with date and value properties,
     *   sorted by chronologic order.
     * - `ref` an object to compare to. It should have a lable and
     *    value properties
     * - `current` should be the current value of the stats. It should have
     *   a label and value property
     * - `options` can define alternive way to extract the value and date out
     *   of the series array. It may have a getValue and getDate properties that
     *   take as argument an item of the series array and return respectively
     *   its value and date.
     * - `legend` should be an object with a y property. Used for the y axis
     *   legend.
     *
     */
    describe('scdChartHistory', function() {

      beforeEach(function() {
        elem = compile([
          '<scd-chart-history',
          '  scd-layout="layout"',
          '  scd-series="series"',
          '  scd-ref="ref"',
          '  scd-current="current"',
          '  scd-options="options"',
          '>',
          '< /scd-chart-history>'
        ].join(''))(scope);
      });

      it('should set up scales', function() {
        var isolatedScope, now = (new Date()).getTime();

        scope.layout = Layout.contentSizing({
          innerWidth: 100,
          innerHeight: 100
        });

        scope.series = _.range(30).map(function(day) {
          return {
            date: new Date(now - (day*24*60*60*1000)),
            someField: 50 + day
          };
        });

        scope.ref = {
          id: 'someId',
          label: 'some ref',
          value: 65
        };

        scope.current = {
          label: 'Current Value',
          value: scope.series.slice(-1).pop().someField
        };

        scope.options = {
          getValue: function(day) {
            return day.someField;
          }
        };

        scope.$apply();
        isolatedScope = elem.isolateScope();

        expect(isolatedScope.ticksFormatter).toBeDefined();
        expect(isolatedScope.scales).toBeDefined();
      });
    });


  });

})();
