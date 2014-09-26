(function() {
  'use strict';

  angular.module('scdSelector.services', [
    'scceUser.services',
  ]).

  /**
   * Get a list of student and keep tract of a selected student.
   *
   * Can be share by directive and controller to keep track of which student
   * the current user is watching or editing.
   *
   * If the current user is not an admin or staff, he won't be able to pick and
   * the selected user will be the current user (assuming he's a student).
   *
   * Return a promising resolving to a selector object with the
   * following properties:
   *
   * - `students` (list of student selectable),
   * - `selectedId` (id of the selected student),
   * - `available` (can the current user select a student other than
   *   him / herself)
   *
   */
  factory('scdSelectedStudent', ['scceCurrentUserApi', 'scceUsersApi', '$q',
    function(scceCurrentUserApi, scceUsersApi, $q) {
      var selector = null,
        selectorPromise = null,
        studentsPromise = null;

      function addStudents(students) {
        if (!selector) {
          return $q.reject('selector not instantiated');
        }

        if (!selector.students) {
          selector.students = students;
        } else {
          selector.students = selector.students.concat(students);
          selector.students.cursor = students.cursor;
        }

        if (students.cursor) {
          return scceUsersApi.listStudents(students.cursor);
        }
      }

      function listStudents(selector) {
        if (selector.students || studentsPromise) {
          return;
        }

        studentsPromise = scceUsersApi.listStudents().then(function(studentList) {
          return addStudents(studentList);
        })['finally'](function() {
          studentsPromise = null;
        });
      }

      return function() {
        if (selector) {
          return $q.when(selector);
        }

        if (selectorPromise) {
          return $q.when(selectorPromise);
        }

        selectorPromise = scceCurrentUserApi.auth().then(function(user) {

          if (!user.isLoggedIn) {
            return $q.reject('You need to be login.');
          }

          selector = {
            students: null,
            selected: null,
            available: false
          };

          if (user.isStudent) {
            selector.selected = user;
          }

          if (user.isStaff || user.isAdmin) {
            selector.available = true;
            listStudents(selector);
          }

          return selector;
        })['finally'](function(){
          selectorPromise = null;
        });

        return selectorPromise;
      };
    }
  ])

  ;

})();
