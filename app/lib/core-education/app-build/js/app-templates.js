angular.module('scCoreEducation.templates', ['views/sccoreeducation/home.html', 'views/sccoreeducation/student-list.html', 'views/sccoreeducation/user-list.html', 'views/sccoreeducation/user/login.html']);

angular.module("views/sccoreeducation/home.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("views/sccoreeducation/home.html",
    "<h1>Hello world</h1>");
}]);

angular.module("views/sccoreeducation/student-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("views/sccoreeducation/student-list.html",
    "<h1>{{ctrl.userType}}</h1>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-md-8\">\n" +
    "        <table class=\"table table-striped student-list\">\n" +
    "            <thead>\n" +
    "                <tr>\n" +
    "                    <th>Profile</th>\n" +
    "                    <th>Name</th>\n" +
    "                    <th>Year</th>\n" +
    "                    <th>Is registered</th>\n" +
    "                    <th>Is student</th>\n" +
    "                    <th>Is Staff</th>\n" +
    "                </tr>\n" +
    "            </thead>\n" +
    "            <tbody>\n" +
    "                <tr ng-repeat=\"user in ctrl.users track by user.studentId\">\n" +
    "                    <td ng-controller=\"SccePortraitUploadListCtrl as uploadCtrl\" class=\"upload-portrait\">\n" +
    "                        <a href=\"\" ng-click=\"uploadCtrl.showForm = true\"><img ng-if=\"!uploadCtrl.showForm\" ng-src=\"{{uploadCtrl.image(user.image, 32)}}\" ng-attr-alt=\"{{user.displayName}}'s portrait;\"/></a>\n" +
    "                        <input ng-if=\"uploadCtrl.showForm\" type=\"file\" ng-file-select=\"uploadCtrl.upload(user, $files)\" />\n" +
    "                    </td>\n" +
    "                    <td>{{user.displayName}}</td>\n" +
    "                    <td>{{user.year}}</td>\n" +
    "                    <td>\n" +
    "                        <input type=\"checkbox\" ng-checked=\"user.id\" disabled=\"disabled\">\n" +
    "                    </td>\n" +
    "                    <td>\n" +
    "                        <input type=\"checkbox\" ng-checked=\"user.isStudent\" disabled=\"disabled\">\n" +
    "                    </td>\n" +
    "                    <td>\n" +
    "                        <input type=\"checkbox\" ng-checked=\"user.isStaff\" ng-disabled=\"user.isStaff || !user.id\" ng-click=\"ctrl.makeStaff(user)\">\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr ng-if=\"ctrl.users.length == 0\">\n" +
    "                    <td colspan=\"4\">No {{ctrl.userType}}</td>\n" +
    "                </tr>\n" +
    "                <tr ng-if=\"ctrl.users == null\">\n" +
    "                    <td colspan=\"4\">Loading {{ctrl.userType}}</td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "\n" +
    "            <tfoot ng-show=\"ctrl.users.cursor\">\n" +
    "                <tr>\n" +
    "                    <td colspan=\"8\" class=\"more-btn\">\n" +
    "                        <button class=\"btn btn-primary\" ng-click=\"ctrl.getMore()\" ng-disabled=\"ctrl.loading\">More</button>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "            </tfoot>\n" +
    "\n" +
    "        </table>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"col-md-4\" ng-if=\"ctrl.currentUser.isAdmin\">\n" +
    "        <div>\n" +
    "            <form role=\"form\" id=\"upload-form\">\n" +
    "                <fielset>\n" +
    "                    <legend>Upload student list</legend>\n" +
    "\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label for=\"file-select\">Select a csv file to upload :</label>\n" +
    "                        <input type=\"file\" id=\"file-select\" class=\"form-control\" ng-file-select=\"ctrl.fileSelected($files, ctrl.upload)\" scce-file=\"ctrl.upload.file\">\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label for=\"file-year\">Year :</label>\n" +
    "                        <input type=\"text\" class=\"form-control\" id=\"file-year\" placeholder=\"YYYY\" ng-model=\"ctrl.upload.year\" ng-pattern=\"/\\d+/\" ng-minlength=\"4\" ng-maxlength=\"4\" />\n" +
    "                    </div>\n" +
    "\n" +
    "                    <button type=\"submit\" class=\"btn btn-primary btn-block\" ng-click=\"ctrl.uploadFile(ctrl.upload)\" ng-disabled=\"!ctrl.upload.file || !ctrl.upload.year || ctrl.upload.inProgress\" id=\"upload-file\">\n" +
    "                        Upload\n" +
    "                    </button>\n" +
    "                    <hr/>\n" +
    "                    <p>Expecting a csv file with the following format:</p>\n" +
    "                    <pre>\n" +
    "S/N,Surname,Student Name,NUS Email\n" +
    "1,Bob,\"Smith, Bob\",A0000001@NUS.EDU.SG\n" +
    "2,Alice,Alice Brown,A0000002@NUS.EDU.SG\n" +
    "...</pre>\n" +
    "                </fielset>\n" +
    "            </form>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("views/sccoreeducation/user-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("views/sccoreeducation/user-list.html",
    "<h1>{{ctrl.userType}}</h1>\n" +
    "\n" +
    "\n" +
    "<table class=\"table table-striped\">\n" +
    "    <thead>\n" +
    "        <tr>\n" +
    "            <th>Photo</th>\n" +
    "            <th>First name</th>\n" +
    "            <th>Last name</th>\n" +
    "            <th>Is registered</th>\n" +
    "            <th>Is student</th>\n" +
    "            <th>Is Staff</th>\n" +
    "        </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "        <tr ng-repeat=\"user in ctrl.users track by user.id\">\n" +
    "            <td>\n" +
    "                <img ng-src=\"{{user.image.url}}\" />\n" +
    "            </td>\n" +
    "            <td>{{user.name.givenName}}</td>\n" +
    "            <td>{{user.name.familyName}}</td>\n" +
    "            <td>\n" +
    "                <input type=\"checkbox\" ng-checked=\"user.id\" disabled=\"disabled\">\n" +
    "            </td>\n" +
    "            <td>\n" +
    "                <input type=\"checkbox\" ng-checked=\"user.isStudent\" disabled=\"disabled\">\n" +
    "            </td>\n" +
    "            <td>\n" +
    "                <input type=\"checkbox\" ng-checked=\"user.isStaff\" ng-disabled=\"user.isStaff || !user.id\" ng-click=\"ctrl.makeStaff(user)\">\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "        <tr ng-if=\"ctrl.users.length == 0\">\n" +
    "            <td colspan=\"6\">No {{ctrl.userType}}</td>\n" +
    "        </tr>\n" +
    "        <tr ng-if=\"ctrl.users == null\">\n" +
    "            <td colspan=\"6\">Loading {{ctrl.userType}}</td>\n" +
    "        </tr>\n" +
    "\n" +
    "    </tbody>\n" +
    "    <tfoot ng-show=\"ctrl.users.cursor\">\n" +
    "        <tr>\n" +
    "            <td colspan=\"6\" class=\"more-btn\">\n" +
    "                <button class=\"btn btn-primary\" ng-click=\"ctrl.getMore()\" ng-disabled=\"ctrl.loading\">More</button>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "    </tfoot>\n" +
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
