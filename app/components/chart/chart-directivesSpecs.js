/* jshint camelcase: false*/
/* global describe, beforeEach, module, it, inject, expect */

(function() {
  'use strict';

  describe('scdChart.directives', function() {
    var compile, scope, elem, Layout, _;

    beforeEach(module(
      'scdChart.directives',
      'scceSvg.services',
      'views/scdashboard/charts/meter.html'
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

  });

})();
