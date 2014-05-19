(function() {
  'use strict';

  var data = {
    review: {
      average: {
        'All residents': {
          'All Categories': 70,
          'Traumatic Disorders': 71,
          'Cardiovascular Disorders': 69
        },
        'PGY 1': {
          'All Categories': 69,
          'Traumatic Disorders': 70,
          'Cardiovascular Disorders': 68
        },
        'PGY 2': {
          'All Categories': 71,
          'Traumatic Disorders': 72,
          'Cardiovascular Disorders': 70
        }
      },
      students: [{
        'id': 'x1',
        'firstName': 'Alice',
        'lastName': 'Smith',
        'PGY': 2,
        'All Categories': 71,
        'Traumatic Disorders': 72,
        'Cardiovascular Disorders': 70
      }, {
        'id': 'x2',
        'firstName': 'Bob',
        'lastName': 'Taylor',
        'PGY': 1,
        'All Categories': 69,
        'Traumatic Disorders': 70,
        'Cardiovascular Disorders': 68
      }]
    },
    prev: '',
    next: ''
  };

  function layout(innerHeight, margin, width) {
    margin = margin || {top: 20, right: 50, bottom:30, left: 150};
    width = width || 900;

    return {
      margin: margin,
      width: width,
      height: innerHeight + margin.top + margin.bottom,
      innerWidth: width - margin.right - margin.left,
      innerHeight: innerHeight
    };

  }

  function ReviewCtrl($scope, window) {
    this._ = window._;
    this.d3 = window.d3;
    this.scope = $scope;

    $scope.residents = [
      'All residents',
      'PGY 1',
      'PGY 2'
    ];
    $scope.categories = [
      'All Categories',
      'Traumatic Disorders',
      'Cardiovascular Disorders'
    ];
    $scope.filters = {
      category: $scope.categories[0],
      resident: $scope.residents[0]
    };
    $scope.layout = layout(data.review.students.length * 20); // 20px per student

    $scope.setResident = this.filterData.bind(this);

    this.filterData();
    this.setScales();
  }


  ReviewCtrl.prototype.setScales = function() {
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
    this.scope.review.students.forEach(function(student) {
      student.fullName = student.firstName + ' ' + student.lastName;
      self.scope.scales.y(student.id);
    });
    this.scope.scales.y = this.scope.scales.y.rangePoints([this.scope.layout.innerHeight, 0], 1);
  };


  ReviewCtrl.prototype.filterData = function() {
    var target;

    if (
      !this.scope.filters ||
      !this.scope.filters.resident ||
      this.scope.filters.resident.length <= 4 ||
      this.scope.filters.resident === 'All residents'
    ) {
      this.scope.review = data.review;
      this.setLayout();
      return;
    } else {
      target = this.scope.filters.resident;
    }

    this.scope.review = this._.clone(data.review);
    this.scope.review.students = this._.filter(data.review.students, function(s){
      return s.PGY === parseInt(target[4], 10);
    });
    this.setLayout();
  };


  ReviewCtrl.prototype.setLayout = function() {
    this.scope.layout = layout(this.scope.review.students.length * 20); // 20px per student
  };


  angular.module('scdReview.controllers', ['scceSvg.directives']).

  controller('scdReviewCtrl', ['$scope', '$window', ReviewCtrl])

  ;

})();