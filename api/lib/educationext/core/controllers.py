"""Main Html handlers

Demo file upload and encryption.

"""

import json
import urllib

from google.appengine.api import users
from jsonschema import ValidationError

from educationext.core import api
from educationext.core import models
from educationext.core.exceptions import ModelError, DuplicateEntityError
from educationext.core.utils import ApiRequestHandler
from webapp2ext import swagger


class UserApi(ApiRequestHandler):
    """Handler request on user login status

    """
    resource = api.resource(
        path="/user",
        desc="Operations about current user authentication"
    )
    path = resource.endpoint('/user')

    @path.operation(
        type_="User",
        alias="isloggedIn",
        parameters=[
            swagger.String(
                name="returnUrl",
                description="Url to redirect user after login",
                param_type="query",
                required=False
            )
        ],
        responses=[
            swagger.Message(200, "Ok"),
            swagger.Message(401, "Unauthorized"),
        ]
    )
    def get(self):
        """Return the user info if logged in or the url to login
        if the user is logged off.

        TODO: get and use user info instead of user nickname

        """
        guser = users.get_current_user()
        return_url = self.request.GET.get('returnUrl')
        return_url = urllib.unquote(return_url) if return_url else '/'
        if not guser:
            self.render_json(
                {
                    'error': "No user logged in",
                    'loginUrl': users.create_login_url(return_url),
                },
                401
            )
            return

        resp = {
            'name': guser.nickname(),
            # 'isAdmin': users.is_current_user_admin(),
            'isAdmin': True, # For review purposes every logged in user are admin
            'isStaff': False,
            'isStudent': False,
            'logoutUrl': users.create_logout_url(return_url),
        }

        user = self.get_current_user_data()
        if user:
            resp['name'] = user.full_name
            resp['isStudent'] = user.student_id is not None
            resp['isStaff'] = user.staff_id is not None

        self.render_json(resp)


student_resource = api.resource(
    '/students', desc="Resource related to student"
)

class StudentListApi(ApiRequestHandler):
    """Handle student list resource.

    """
    path = student_resource.endpoint("/students")

    @path.operation(
        type_="StudentList",
        alias="listStudents",
        parameters=[
            swagger.String(
                name="cursor",
                description="Cursor to query the next page",
                param_type="query"
            )
        ],
        responses=[
            swagger.Message(200, "Ok"),
            swagger.Message(401, "Unauthorized"),
            swagger.Message(403, "Forbidden"),
        ]
    )
    def get(self):
        """List all students (20 per page).

        The current user must be logged in as an app admin to see
        the list of student.

        """
        self.admin_required()

        cursor_key = self.request.GET.get('cursor')
        students, cursor, _ = models.Student.get_students(cursor_key)
        return self.render_json({
            'students': [s.summary() for s in students],
            'cursor': cursor.urlsafe() if cursor else ''
        })

    @path.operation(
        type_="Student",
        alias="addStudent",
        parameters=[
            swagger.Param(
                name="student",
                description="Student to add",
                type_="StudentData",
                param_type="body"
            )
        ],
        responses=[
            swagger.Message(200, "Ok"),
            swagger.Message(400, "Bad Request"),
            swagger.Message(401, "Unauthorized"),
            swagger.Message(403, "Forbidden"),
            swagger.Message(409, "Conflict"),
        ]
    )
    def post(self):
        """Create a new student

        Student are registered by admins. The student email should used
        for authentication. In this implementation, the email is
        registered with a google account. The student needs to log in
        with that account to access his information.

        """
        self.staff_required()
        try:
            student = models.Student.new_student(
                json.loads(self.request.body)
            )
        except DuplicateEntityError, e:
            self.render_json({'error': e.message}, 409)
        except (ModelError, ValidationError, ValueError, AttributeError), e:
            self.render_json({'error': e.message}, 400)
        else:
            self.render_json(student.summary())


class StudentApi(ApiRequestHandler):
    """Handle student details.

    """
    path = student_resource.endpoint("/students/<studentId>")

    @path.operation(
        type_="Student",
        alias="editStudent",
        parameters=[
            swagger.String(
                name="studentId",
                param_type="path",
                description="Id of student details to edit",
                required=True
            ),
            swagger.Param(
                name="student",
                description="Details of the student",
                type_="StudentData",
                param_type="body"
            )
        ],
        responses=[
            swagger.Message(200, "Ok"),
            swagger.Message(400, "Bad Request"),
            swagger.Message(401, "Unauthorized"),
            swagger.Message(403, "Forbidden")
        ]
    )
    def put(self, studentId):
        """Edit a student details.

        """
        student = None
        user = models.User.by_student_id(studentId)
        if not user:
            student = models.Student.get_by_id(studentId)

        if not user and not student:
            self.abort(404)

        current_user = self.get_current_user_data()
        if current_user is None or current_user.staff_id is None:
            self.staff_required()

        try:
            details = json.loads(self.request.body)
            if user:
                user.update_details(details)
            else:
                student.update_details(details)
        except (ValidationError, ValueError, AttributeError), e:
            self.render_json({'error': e.message}, 400)
        else:
            pass


staff_resource = api.resource(
    '/staff', desc="Resource related to staff"
)

class StaffListApi(ApiRequestHandler):
    """Handle staff list resource.

    """
    path = staff_resource.endpoint("/staff")

    @path.operation(
        type_="StaffList",
        alias="listStaffs",
        parameters=[
            swagger.String(
                name="cursor",
                description="Cursor to query the next page",
                param_type="query"
            )
        ],
        responses=[
            swagger.Message(200, "Ok"),
            swagger.Message(401, "Unauthorized"),
            swagger.Message(403, "Forbidden"),
        ]
    )
    def get(self):
        """List all staff (20 per page).

        The current user must be logged in as an app admin or a staff
        member to see the list of staff.

        """
        self.staff_required()

        cursor_key = self.request.GET.get('cursor')
        staff, cursor, _ = models.Staff.get_staff(cursor_key)
        return self.render_json({
            'staff': [s.summary() for s in staff],
            'cursor': cursor.urlsafe() if cursor else ''
        })

    @path.operation(
        type_="Staff",
        alias="addStaff",
        parameters=[
            swagger.Param(
                name="staff",
                description="Staff to add",
                type_="StaffData",
                param_type="body"
            )
        ],
        responses=[
            swagger.Message(200, "Ok"),
            swagger.Message(400, "Bad Request"),
            swagger.Message(401, "Unauthorized"),
            swagger.Message(403, "Forbidden"),
            swagger.Message(409, "Conflict"),
        ]
    )
    def post(self):
        """Create a new staff

        Staff are registered by admins. The staff email should used
        for authentication. In this implementation, the email is
        registered with a google account. The staff needs to log in
        with that account to access his information.

        """
        self.staff_required()
        try:
            staff = models.Staff.new_staff(
                json.loads(self.request.body)
            )
        except DuplicateEntityError, e:
            self.render_json({'error': e.message}, 409)
        except (ModelError, ValidationError, ValueError, AttributeError), e:
            self.render_json({'error': e.message}, 400)
        else:
            self.render_json(staff.summary())