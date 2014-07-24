(function() {
  'use strict';

  function layout(innerHeight, margin, width) {
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

  function FirstAidCtrl($scope, currentUser, window, firstAidApi) {
    this._ = window._;
    this.d3 = window.d3;
    this.firstAidApi = firstAidApi;
    this.scope = $scope;

    $scope.residents = firstAidApi.residents;
    $scope.categories = firstAidApi.categories;
    $scope.stats = firstAidApi.stats;
    $scope.cursor = {};

    $scope.filters = {
      chart: {
        year: firstAidApi.residents[0],
        sortBy: {
          category: firstAidApi.categories[0],
          property: firstAidApi.stats[0]
        }
      },
      table: {
        year: firstAidApi.residents[0],
        show: {
          category: firstAidApi.categories[0],
          property: firstAidApi.stats[0]
        }
      }
    };

    $scope.firstAid = {
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

  FirstAidCtrl.prototype.getTableData = function() {
    this.firstAidApi.all().then(this.updateTableData.bind(this));
  };

  FirstAidCtrl.prototype.updateTableData = function(data) {
    this.scope.firstAid.table.source = data.firstAid;
    this.filterTableData();
  };

  FirstAidCtrl.prototype.filterTableData = function() {
    if (this.scope.filters.table.year.id) {
      this.scope.firstAid.table.students = this._.filter(
        this.scope.firstAid.table.source.students, {
          'PGY': this.scope.filters.table.year.id
        }
      );
    } else {
      this.scope.firstAid.table.students = this.scope.firstAid.table.source.students;
    }

    this.sortTableDataBy(this.scope.firstAid.table.sortedBy);
  };

  FirstAidCtrl.prototype.sortTableDataBy = function(sortBy) {
    var getKey,
      self = this;

    this.scope.firstAid.table.reversed = (
      this.scope.firstAid.table.sortedBy === sortBy &&
      this.scope.firstAid.table.reversed === false
    );

    this.scope.firstAid.table.sortedBy = sortBy;

    if (this.scope.firstAid.table.reversed) {
      this.scope.firstAid.table.students.reverse();
      return;
    }

    switch(sortBy) {
    case 'selected-category':
      getKey = function(student) {
        return student.data[self.scope.filters.table.show.category].result;
      };
      break;
    case 'PGY-average':
      getKey = function(student) {
        return self.scope.firstAid.table.source.overallAverage['PGY ' + student.PGY][self.scope.filters.table.show.category][self.scope.filters.table.show.property.id];
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

    this.scope.firstAid.table.students = this._.sortBy(
      this.scope.firstAid.table.students, getKey
    );

  };

  FirstAidCtrl.prototype.getChartData = function() {
    this.firstAidApi.next('', this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  FirstAidCtrl.prototype.nextChartData = function() {
    this.firstAidApi.next(this.scope.cursor.next, this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  FirstAidCtrl.prototype.prevChartData = function() {
    this.firstAidApi.prev(this.scope.cursor.prev, this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  FirstAidCtrl.prototype.updateChartData = function(data) {
    this.scope.cursor.next = data.next;
    this.scope.cursor.prev = data.prev;
    this.scope.firstAid.chart = data.firstAid;
    this.setLayout();
    this.setScales();
  };

  FirstAidCtrl.prototype.setScales = function() {
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
    this.scope.firstAid.chart.students.forEach(function(student) {
      self.scope.scales.y(student.id);
    });
    this.scope.scales.y = this.scope.scales.y.rangePoints([this.scope.layout.innerHeight, 0], 1);
  };


  FirstAidCtrl.prototype.setLayout = function() {
    this.scope.layout = layout(this.scope.firstAid.chart.students.length * 20); // 20px per student
  };


  angular.module('scdFirstAid.controllers', ['scceSvg.directives', 'scdFirstAid.services']).

  controller('scdFirstAidCtrl', ['$scope', 'currentUser', '$window', 'scdFirstAidApi', FirstAidCtrl])

  ;

})();