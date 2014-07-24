(function() {
  'use strict';

  angular.module('scdSelector.services', [
    'scceStudents.services',
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
  factory('scdSelectedStudent', ['scceCurrentUserApi', 'scceStudentsApi', '$q',
    function(scceCurrentUserApi, scceStudentsApi, $q) {
      var selector = null,
        selectorPromise = null,
        studentsPromise = null;

      function listStudents(selector) {
        if (selector.students || studentsPromise) {
          return;
        }

        studentsPromise = scceStudentsApi.all().then(function(studentList) {
          selector.students = studentList;
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
            selectedId: null,
            available: false
          };

          if (user.studentId) {
            selector.selectedId = user.studentId;
          }

          if (user.staffId || user.isAdmin) {
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
