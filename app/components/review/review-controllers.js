(function() {
  'use strict';

  function layout(opts) {
    opts = opts || {};
    opts.innerHeight = opts.innerHeight || 400;
    opts.innerWidth = opts.innerWidth || 300;
    opts.margin = opts.margin || {};
    opts.margin.top = opts.margin.top || 20;
    opts.margin.right = opts.margin.right || 20;
    opts.margin.bottom = opts.margin.bottom || 20;
    opts.margin.left = opts.margin.left || 20;
    opts.width = opts.innerWidth + opts.margin.right + opts.margin.left;
    opts.height = opts.innerHeight + opts.margin.top + opts.margin.bottom;
    return opts;
  }

  function layoutFromInnerHeight(innerHeight, margin, width) {
    margin = margin || {
      top: 20,
      right: 150,
      bottom: 30,
      left: 150
    };
    width = width || 900;

    return {
      margin: margin,
      width: width,
      height: innerHeight + margin.top + margin.bottom,
      innerWidth: width - margin.right - margin.left,
      innerHeight: innerHeight
    };

  }

  function GlobalReviewCtrl($scope, window, reviewApi) {
    this._ = window._;
    this.d3 = window.d3;
    this.reviewApi = reviewApi;
    this.scope = $scope;

    $scope.residents = reviewApi.residents;
    $scope.categories = reviewApi.categories;
    $scope.stats = reviewApi.stats;
    $scope.cursor = {};

    $scope.filters = {
      chart: {
        year: reviewApi.residents[0],
        sortBy: {
          category: reviewApi.categories[0],
          property: reviewApi.stats[0]
        }
      },
      table: {
        year: reviewApi.residents[0],
        show: {
          category: reviewApi.categories[0],
          property: reviewApi.stats[0]
        }
      }
    };

    $scope.review = {
      chart: {},
      table: {
        sortedBy: 'firstName',
        searchFor: '',
        reversed: null,
        source: {},
        students: [],
      }
    };

    $scope.next = this.nextChartData.bind(this);
    $scope.prev = this.prevChartData.bind(this);
    $scope.chartFiltersChanged = this.getChartData.bind(this);
    $scope.tableFiltersChanged = this.filterTableData.bind(this);
    $scope.tableSortBy = this.sortTableDataBy.bind(this);

    this.getChartData();
    this.getTableData();
  }

  GlobalReviewCtrl.prototype.getTableData = function() {
    this.reviewApi.all().then(this.updateTableData.bind(this));
  };

  GlobalReviewCtrl.prototype.updateTableData = function(data) {
    this.scope.review.table.source = data.review;
    this.filterTableData();
  };

  GlobalReviewCtrl.prototype.filterTableData = function() {
    if (this.scope.filters.table.year.id) {
      this.scope.review.table.students = this._.filter(
        this.scope.review.table.source.students, {
          'PGY': this.scope.filters.table.year.id
        }
      );
    } else {
      this.scope.review.table.students = this.scope.review.table.source.students;
    }

    this.sortTableDataBy(this.scope.review.table.sortedBy);
  };

  GlobalReviewCtrl.prototype.sortTableDataBy = function(sortBy) {
    var getKey,
      self = this;

    this.scope.review.table.reversed = (
      this.scope.review.table.sortedBy === sortBy &&
      this.scope.review.table.reversed === false
    );

    this.scope.review.table.sortedBy = sortBy;

    if (this.scope.review.table.reversed) {
      this.scope.review.table.students.reverse();
      return;
    }

    switch (sortBy) {
      case 'selected-category':
        getKey = function(student) {
          return student.data[self.scope.filters.table.show.category].result;
        };
        break;
      case 'PGY-average':
        getKey = function(student) {
          return self.scope.review.table.source.overallAverage['PGY ' + student.PGY][self.scope.filters.table.show.category][self.scope.filters.table.show.property.id];
        };
        break;
      case '%-completed':
        getKey = function(student) {
          return student.data[self.scope.filters.table.show.category].completed;
        };
        break;
      case 'probability-of-passing':
        getKey = function(student) {
          return student.data[self.scope.filters.table.show.category].probabilityOfPassing;
        };
        break;
      default:
        getKey = function(student) {
          return student[sortBy];
        };
        break;
    }

    this.scope.review.table.students = this._.sortBy(
      this.scope.review.table.students, getKey
    );

  };

  GlobalReviewCtrl.prototype.getChartData = function() {
    this.reviewApi.next('', this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  GlobalReviewCtrl.prototype.nextChartData = function() {
    this.reviewApi.next(this.scope.cursor.next, this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  GlobalReviewCtrl.prototype.prevChartData = function() {
    this.reviewApi.prev(this.scope.cursor.prev, this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  GlobalReviewCtrl.prototype.updateChartData = function(data) {
    this.scope.cursor.next = data.next;
    this.scope.cursor.prev = data.prev;
    this.scope.review.chart = data.review;
    this.setLayout();
    this.setScales();
  };

  GlobalReviewCtrl.prototype.setScales = function() {
    var self = this;

    if (!this.scope.scales) {
      this.scope.scales = {
        x: this.d3.scale.linear().domain(
          [0, 100]
        ).range(
          [0, this.scope.layout.innerWidth]
        )
      };
    }

    this.scope.scales.y = this.d3.scale.ordinal();
    this.scope.review.chart.students.forEach(function(student) {
      self.scope.scales.y(student.id);
    });
    this.scope.scales.y = this.scope.scales.y.rangePoints([this.scope.layout.innerHeight, 0], 1);
  };


  GlobalReviewCtrl.prototype.setLayout = function() {
    this.scope.layout = layoutFromInnerHeight(this.scope.review.chart.students.length * 20); // 20px per student
  };


  angular.module('scdReview.controllers', [
    'scceSvg.directives',
    'scdReview.services',
    'scdSelector.services'
  ]).

  controller('scdGlobalReviewCtrl', [
    '$scope',
    '$window',
    'scdReviewApi',
    'scdSelectedStudent',
    GlobalReviewCtrl
  ]).

  controller('scdReviewCtrl', ['scdSelectedStudent', 'scdReviewApi', '$window',
    function(scdSelectedStudent, scdReviewApi, $window) {
      var self = this,
        d3 = $window.d3;

      /** Student selector **/

      this.selector = null;
      this.showGlobals = null;
      this.studentPerformance = null;

      this.showGlobalPerformance = function(doShow) {
        self.showGlobals = doShow;
        if (!doShow) {
          return;
        }

        if (!self.selector.available) {
          self.showGlobals = false;
          // TODO: redirect.
        } else {
          self.selector.selectedId = null;
        }
      };

      this.showStudentPerformance = function(studentId) {
        if (!studentId) {
          self.studentPerformance = null;
          self.showGlobalPerformance(true);
          return;
        }

        self.showGlobals = false;
        self.setPerformances();
      };

      scdSelectedStudent().then(function(selector) {
        self.selector = selector;
        self.showStudentPerformance(selector.selectedId);
      });

      /** Student performance **/

      this.comparison = {
        available: [
          {label: 'National Average', id: 'nationalAvg', type: 'Average'},
          {label: 'University Average', id: 'uniAvg', type: 'Average'},
        ],
      };
      this.comparison.selected = this.comparison.available[0];

      this.performances = {
        data: null,
        cumulative: {
          layout: layout({
            innerWidth: 400,
            innerHeight: 250,
            margin: {top: 20, right: 150, bottom: 30, left: 70},
          })
        }
      };

      this.setPerformances = function(studentId) {
        self.performances.data = null;
        scdReviewApi.performancesById(studentId).then(function(data) {
          var xTicks;

          self.performances.data = data;

          // init scales
          self.performances.cumulative.xScale = d3.scale.ordinal();
          self.performances.cumulative.yScale = d3.scale.linear();
          xTicks = d3.time.scale();
          self.performances.cumulative.ticksFormatter = d3.time.format('%b %y');

          // setup scale domains
          self.performances.cumulative.yScale.domain([0, 100]);
          xTicks.domain([
            data.progress[0].date,
            data.progress[data.progress.length - 1].date
          ]);
          data.progress.forEach(function(day) {
            self.performances.cumulative.xScale(day.date);
          });

          // setup scale ranges
          self.performances.cumulative.yScaleReversed = (
            self.performances.cumulative.yScale.copy().range(
              [self.performances.cumulative.layout.innerHeight, 0]
            )
          );
          self.performances.cumulative.yScale.range(
            [0, self.performances.cumulative.layout.innerHeight]
          );
          self.performances.cumulative.xScale.rangeBands(
            [0, self.performances.cumulative.layout.innerWidth], 0, 0
          );

          // Set x ticks
          self.performances.cumulative.xTicks = xTicks.ticks(3);
          self.performances.cumulative.ticksFormatter = d3.time.format('%b %y');
        });
      };
    }
  ])

  ;

})();