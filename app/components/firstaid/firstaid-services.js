/* ** DEPRECATED ** */

(function() {
  'use strict';

  var firstNames = [
      'Noah', 'Liam', 'Jacob', 'Mason', 'William', 'Ethan', 'Michael',
      'Sophia', 'Emma', 'Olivia', 'Isabella', 'Ava', 'Mia', 'Emily'
    ],
    lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis',
      'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor',
      'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson',
      'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis'
    ],
    residents = [{
      'id': 1,
      'title': 'PGY 1',
    }, {
      'id': 2,
      'title': 'PGY 2',
    }, {
      'id': 3,
      'title': 'PGY 3'
    }],
    categories = [
      'Traumatic Disorders',
      'Cardiovascular Disorders'
    ],
    stats = [{
      'id': 'result',
      'title': 'Program Average'
    }, {
      'id': 'completed',
      'title': 'Percentage Completed'
    }, {
      'id': 'probabilityOfPassing',
      'title': 'Probability of Passing ABEM'
    }];

  function newUser(index, _) {
    return {
      'id': 'x' + index,
      'firstName': _.sample(firstNames),
      'lastName': _.sample(lastNames),
      'PGY': _.sample(residents).id,
      'data': newResults(_)
      // 'completed': _.random(0, 100),
      // 'probabilityOfPassing': _.random(50, 100)
    };
  }

  function newResults(_) {
    var results = {},
      allCategories = {};

    categories.forEach(function(name) {
      results[name] = newCategoryResults(_);
    });

    stats.map(function(s) {
      var avg = _.reduce(results, function(avg, result) {
        avg.count++;
        avg.sum += result[s.id];
        return avg;
      }, {
        count: 0,
        sum: 0
      });

      allCategories[s.id] = avg.sum / avg.count; // assume all categories weight the same
    });

    results['All Categories'] = allCategories;

    return results;
  }

  function newCategoryResults(_) {
    return {
      'result': _.random(50, 99),
      'completed': _.random(1, 100),
      'probabilityOfPassing': _.random(50, 100),
    };
  }

  function calcOverallAverage(users, _) {
    var results = {
      'All Residents': _calcOverallAverage(users, _)
    };

    residents.forEach(function(year) {
      results[year.title] = _calcOverallAverage(_.filter(users, {
        'PGY': year.id
      }), _);
    });

    return results;
  }

  function _calcOverallAverage(users, _) {
    var results = {};

    categories.concat(['All Categories']).forEach(function(category) {
      results[category] = {};
      stats.forEach(function(stat) {
        var avg = _.reduce(users, function(avg, user) {
          avg.count++;
          avg.sum += user.data[category][stat.id];
          return avg;
        }, {
          count: 0,
          sum: 0
        });

        results[category][stat.id] = avg.sum / avg.count;
      });
    });

    return results;
  }

  function getCursor(cursor, defaultValue) {
    if (!cursor) {
      return defaultValue;
    } else {
      return parseInt(cursor, 10);
    }
  }

  function setCursor(results, pool, prev, next) {
    results.prev = prev > 0 ? prev : '';
    results.next = next < pool.length ? next : '';
    return results;
  }

  angular.module('scdFirstAid.services', []).

  factory('scdFirstAidApi', ['$window', '$q',
    function(window, $q) {
      var _ = window._,
        users = _.range(1, 61).map(function(index) {
          return newUser(index, _);
        }),
        average = calcOverallAverage(users, _);

      return {
        categories: ['All Categories'].concat(categories),
        residents: [{
          'title': 'All Residents',
          'id': ''
        }].concat(residents),
        stats: stats,

        _get: function(start, end, opt) {
          var pool = users;

          if (opt && opt.year && opt.year.id) {
            pool = _.filter(pool, {
              'PGY': opt.year.id
            });
          }


          if (opt && opt.sortBy && opt.sortBy.category && opt.sortBy.property && opt.sortBy.property.id) {
            pool = _.sortBy(pool, function(student) {
              if (
                student.data[opt.sortBy.category] &&
                student.data[opt.sortBy.category][opt.sortBy.property.id]
              ) {
                return -student.data[opt.sortBy.category][opt.sortBy.property.id];
              }
            });
          }

          return $q.when(
            setCursor({
              'firstAid': {
                'overallAverage': average,
                'students': pool.slice(start, end)
              }
            }, pool, start, end)
          );
        },

        next: function(cursor, options) {
          var start, end;

          cursor = getCursor(cursor, 0);
          start = cursor;
          end = cursor + 20;
          return this._get(start, end, options);
        },

        prev: function(cursor, options) {
          var start, end;

          cursor = getCursor(cursor, 20);
          start = cursor - 20;
          end = cursor;
          return this._get(start, end, options);
        },

        all: function() {
          return $q.when({
            'firstAid': {
              'overallAverage': average,
              'students': _.clone(users)
            },
            'prev': '',
            'next': ''
          });
        }
      };
    }
  ])

  ;

})();
