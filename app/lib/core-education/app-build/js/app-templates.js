angular.module('scCoreEducation.templates', ['views/sccoreeducation/home.html', 'views/sccoreeducation/user-list.html', 'views/sccoreeducation/user/login.html']);

angular.module("views/sccoreeducation/home.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("views/sccoreeducation/home.html",
    "<h1>Hello world</h1>");
}]);

angular.module("views/sccoreeducation/user-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("views/sccoreeducation/user-list.html",
    "<h1>{{ctrl.userType}}</h1>\n" +
    "\n" +
    "<table class=\"table table-striped\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th>Photo</th>\n" +
    "      <th>First name</th>\n" +
    "      <th>Last name</th>\n" +
    "      <th>Is student</th>\n" +
    "      <th>Is Staff</th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"user in ctrl.users track by user.id\">\n" +
    "      <td><img ng-src=\"{{user.image.url}}\"/></td>\n" +
    "      <td>{{user.name.givenName}}</td>\n" +
    "      <td>{{user.name.familyName}}</td>\n" +
    "      <td><input type=\"checkbox\" ng-checked=\"user.isStudent\" disabled=\"disabled\"></td>\n" +
    "      <td><input type=\"checkbox\" ng-checked=\"user.isStaff\" ng-disabled=\"user.isStaff\" ng-click=\"ctrl.makeStaff(user)\"></td>\n" +
    "    </tr>\n" +
    "    <tr ng-if=\"ctrl.users.length == 0\">\n" +
    "      <td colspan=\"5\">No {{ctrl.userType}}</td>\n" +
    "    </tr>\n" +
    "    <tr ng-if=\"ctrl.users == null\">\n" +
    "      <td colspan=\"5\">Loading {{ctrl.userType}}</td>\n" +
    "    </tr>\n" +
    "\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("views/sccoreeducation/user/login.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("views/sccoreeducation/user/login.html",
    "<ul class=\"nav navbar-nav navbar-right\">\n" +
    "  <li>\n" +
    "    <p class=\"navbar-text\" ng-if=\"user.loading\">Loading current user info...</p>\n" +
    "    <p class=\"navbar-text\" ng-if=\"user.info.name\">Signed in as {{user.info.displayName}}</p>\n" +
    "  </li>\n" +
    "  <li ng-if=\"user.info\">\n" +
    "    <a ng-href=\"{{user.info.loginUrl}}\" ng-if=\"!user.info.isLoggedIn &amp;&amp; user.info.loginUrl\">\n" +
    "      <i class=\"glyphicon glyphicon-off\"></i> login\n" +
    "    </a>\n" +
    "    <a ng-href=\"{{user.info.logoutUrl}}\" ng-if=\"user.info.isLoggedIn &amp;&amp; user.info.logoutUrl\">\n" +
    "      <i class=\"glyphicon glyphicon-off\"></i> logout\n" +
    "    </a>\n" +
    "  </li>\n" +
    "</ul>");
}]);
